#!/usr/bin/env python3
"""
Process Big Island VR Panoramas - Standalone Script

Downloads Street View tiles, stitches into panoramas, and optionally
applies AI upscaling and depth estimation if dependencies are available.

This script works with minimal dependencies (just PIL and requests).
AI features are enabled when realesrgan and transformers are installed.

Usage:
    python process_panoramas.py --all          # Process all available locations
    python process_panoramas.py --count 5      # Process 5 locations
    python process_panoramas.py --test         # Test one location
"""

import os
import sys
import json
import argparse
import requests
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Tuple
from PIL import Image
import numpy as np

# ============================================================================
# Configuration
# ============================================================================

API_KEY = "AIzaSyBmSDHrsQunVjxhZ4UHQ0asdUY6vZVFszY"
STREETVIEW_URL = "https://maps.googleapis.com/maps/api/streetview"
METADATA_URL = "https://maps.googleapis.com/maps/api/streetview/metadata"

# Check optional dependencies
HAS_REALESRGAN = False
HAS_DEPTH = False

try:
    import torch
    from realesrgan import RealESRGANer
    from basicsr.archs.rrdbnet_arch import RRDBNet
    HAS_REALESRGAN = True
except ImportError:
    pass

try:
    from transformers import AutoImageProcessor, AutoModelForDepthEstimation
    HAS_DEPTH = True
except ImportError:
    pass


def print_banner():
    print("=" * 70)
    print("BIG ISLAND VR - PANORAMA PROCESSOR")
    print("=" * 70)
    print(f"  AI Upscaling (Real-ESRGAN): {'✓ Available' if HAS_REALESRGAN else '✗ Not installed'}")
    print(f"  Depth Estimation:           {'✓ Available' if HAS_DEPTH else '✗ Not installed'}")
    print("=" * 70)


def get_pano_metadata(lat: float, lng: float) -> Optional[Dict]:
    """Get Street View panorama metadata for coordinates"""
    params = {
        "location": f"{lat},{lng}",
        "key": API_KEY,
        "radius": 100,
        "source": "outdoor"
    }
    
    try:
        resp = requests.get(METADATA_URL, params=params, timeout=10)
        data = resp.json()
        
        if data.get("status") == "OK":
            return data
        return None
    except Exception as e:
        print(f"  Error getting metadata: {e}")
        return None


def download_tiles(pano_id: str, output_dir: Path, tile_size: int = 640) -> List[Path]:
    """Download Street View tiles for a panorama"""
    output_dir.mkdir(parents=True, exist_ok=True)
    tiles = []
    
    # Cover full sphere with overlapping tiles
    headings = [0, 60, 120, 180, 240, 300]
    pitches = [-45, 0, 45]
    
    session = requests.Session()
    
    for heading in headings:
        for pitch in pitches:
            params = {
                "pano": pano_id,
                "size": f"{tile_size}x{tile_size}",
                "heading": heading,
                "pitch": pitch,
                "fov": 90,
                "key": API_KEY
            }
            
            url = f"{STREETVIEW_URL}?" + "&".join(f"{k}={v}" for k, v in params.items())
            
            try:
                resp = session.get(url, timeout=30)
                
                if resp.status_code == 200 and len(resp.content) > 1000:
                    filename = f"tile_h{heading:03d}_p{pitch:+03d}.jpg"
                    filepath = output_dir / filename
                    
                    with open(filepath, "wb") as f:
                        f.write(resp.content)
                    
                    tiles.append(filepath)
            except Exception as e:
                print(f"  Warning: Failed tile h={heading} p={pitch}: {e}")
    
    return tiles


def stitch_panorama(tiles_dir: Path, output_path: Path, 
                    output_width: int = 4096) -> bool:
    """Stitch tiles into equirectangular panorama"""
    output_height = output_width // 2
    
    tiles = sorted(tiles_dir.glob("tile_*.jpg"))
    if not tiles:
        print("  No tiles found!")
        return False
    
    # Create canvas
    result = Image.new('RGB', (output_width, output_height), (50, 50, 50))
    
    for tile_path in tiles:
        name = tile_path.stem
        parts = name.split("_")
        heading = int(parts[1][1:])
        pitch_str = parts[2][1:]
        pitch = int(pitch_str.replace('+', ''))
        
        try:
            img = Image.open(tile_path)
            
            # Map heading to x position
            center_x = int((heading / 360) * output_width)
            
            # Map pitch to y position
            center_y = int(((90 - pitch) / 180) * output_height)
            
            # Tile dimensions
            fov_h = int((90 / 360) * output_width)
            fov_v = int((90 / 180) * output_height)
            
            tile_resized = img.resize((fov_h, fov_v), Image.LANCZOS)
            
            paste_x = center_x - fov_h // 2
            paste_y = center_y - fov_v // 2
            
            # Handle wrap-around
            if paste_x < 0:
                result.paste(tile_resized, (paste_x + output_width, paste_y))
            if paste_x + fov_h > output_width:
                result.paste(tile_resized, (paste_x - output_width, paste_y))
            
            result.paste(tile_resized, (paste_x, paste_y))
            
        except Exception as e:
            print(f"  Warning: Failed processing {tile_path.name}: {e}")
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    result.save(output_path, quality=95, optimize=True)
    return True


def upscale_image(input_path: Path, output_path: Path, scale: int = 4) -> bool:
    """Upscale image with Real-ESRGAN (if available)"""
    if not HAS_REALESRGAN:
        print("  Skipping upscale (Real-ESRGAN not installed)")
        return False
    
    try:
        import cv2
        import torch
        
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        half = device == 'cuda'
        
        model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, 
                        num_block=23, num_grow_ch=32, scale=4)
        
        upsampler = RealESRGANer(
            scale=scale,
            model_path='https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
            model=model,
            tile=400,
            tile_pad=10,
            pre_pad=0,
            half=half,
            device=device
        )
        
        img = cv2.imread(str(input_path), cv2.IMREAD_UNCHANGED)
        output, _ = upsampler.enhance(img, outscale=scale)
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(output_path), output)
        
        return True
        
    except Exception as e:
        print(f"  Upscale error: {e}")
        return False


def estimate_depth(input_path: Path, output_path: Path) -> bool:
    """Generate depth map with Depth Anything v2 (if available)"""
    if not HAS_DEPTH:
        print("  Skipping depth (transformers not installed)")
        return False
    
    try:
        import torch
        
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        model_id = "depth-anything/Depth-Anything-V2-Small-hf"
        processor = AutoImageProcessor.from_pretrained(model_id)
        model = AutoModelForDepthEstimation.from_pretrained(model_id).to(device)
        model.eval()
        
        image = Image.open(input_path).convert('RGB')
        original_size = image.size
        
        inputs = processor(images=image, return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = model(**inputs)
            predicted_depth = outputs.predicted_depth
        
        prediction = torch.nn.functional.interpolate(
            predicted_depth.unsqueeze(1),
            size=(original_size[1], original_size[0]),
            mode="bicubic",
            align_corners=False
        ).squeeze()
        
        depth_np = prediction.cpu().numpy()
        depth_min, depth_max = depth_np.min(), depth_np.max()
        depth_normalized = (depth_np - depth_min) / (depth_max - depth_min + 1e-8)
        depth_normalized = (depth_normalized * 255).astype(np.uint8)
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        depth_image = Image.fromarray(depth_normalized, mode='L')
        depth_image.save(output_path, optimize=True)
        
        return True
        
    except Exception as e:
        print(f"  Depth error: {e}")
        return False


def process_location(name: str, lat: float, lng: float, output_base: Path,
                     skip_existing: bool = True) -> Dict:
    """Process a single location through the pipeline"""
    print(f"\n{'='*60}")
    print(f"Processing: {name}")
    print(f"Coordinates: ({lat}, {lng})")
    print(f"{'='*60}")
    
    result = {
        "name": name,
        "lat": lat,
        "lng": lng,
        "success": False,
        "pano_id": None,
        "panorama_path": None,
        "depth_path": None,
        "error": None
    }
    
    # Step 1: Get metadata
    print("\n[1/4] Getting Street View metadata...")
    metadata = get_pano_metadata(lat, lng)
    
    if not metadata:
        result["error"] = "No Street View coverage"
        print(f"  ✗ {result['error']}")
        return result
    
    pano_id = metadata.get("pano_id")
    result["pano_id"] = pano_id
    print(f"  ✓ Found panorama: {pano_id[:16]}...")
    
    # Generate location ID
    loc_id = hashlib.md5(f"{name}_{pano_id}".encode()).hexdigest()[:12]
    
    # Define paths
    tiles_dir = output_base / "tiles" / loc_id
    stitched_path = output_base / "stitched" / f"{loc_id}_pano.jpg"
    upscaled_path = output_base / "upscaled" / f"{loc_id}_4x.jpg"
    depth_path = output_base / "depth" / f"{loc_id}_depth.png"
    final_pano = output_base / "processed" / f"{loc_id}_panorama.jpg"
    final_depth = output_base / "processed" / f"{loc_id}_depth.png"
    
    # Check existing
    if skip_existing and final_pano.exists():
        print("\n  Already processed, skipping...")
        result["success"] = True
        result["panorama_path"] = str(final_pano)
        result["depth_path"] = str(final_depth) if final_depth.exists() else None
        return result
    
    # Step 2: Download tiles
    print("\n[2/4] Downloading Street View tiles...")
    tiles = download_tiles(pano_id, tiles_dir)
    print(f"  ✓ Downloaded {len(tiles)} tiles")
    
    if len(tiles) < 6:
        result["error"] = "Insufficient tiles downloaded"
        print(f"  ✗ {result['error']}")
        return result
    
    # Step 3: Stitch panorama
    print("\n[3/4] Stitching equirectangular panorama...")
    if stitch_panorama(tiles_dir, stitched_path):
        print(f"  ✓ Created panorama: {stitched_path.name}")
    else:
        result["error"] = "Failed to stitch panorama"
        print(f"  ✗ {result['error']}")
        return result
    
    # Step 4a: Upscale (optional)
    print("\n[4/4a] AI Upscaling...")
    source_for_depth = stitched_path
    
    if HAS_REALESRGAN:
        if upscale_image(stitched_path, upscaled_path):
            print(f"  ✓ Upscaled to 4x resolution")
            source_for_depth = upscaled_path
        else:
            print("  ⚠ Upscale failed, using original")
    else:
        print("  - Skipped (Real-ESRGAN not installed)")
    
    # Step 4b: Depth estimation (optional)
    print("\n[4/4b] Depth Estimation...")
    
    if HAS_DEPTH:
        if estimate_depth(source_for_depth, depth_path):
            print(f"  ✓ Generated depth map: {depth_path.name}")
        else:
            print("  ⚠ Depth estimation failed")
    else:
        print("  - Skipped (transformers not installed)")
    
    # Copy to processed directory
    import shutil
    final_pano.parent.mkdir(parents=True, exist_ok=True)
    
    if source_for_depth.exists():
        shutil.copy2(source_for_depth, final_pano)
        result["panorama_path"] = str(final_pano)
    
    if depth_path.exists():
        shutil.copy2(depth_path, final_depth)
        result["depth_path"] = str(final_depth)
    
    result["success"] = True
    
    print(f"\n{'='*60}")
    print("✓ Processing complete!")
    print(f"  Panorama: {final_pano}")
    if final_depth.exists():
        print(f"  Depth:    {final_depth}")
    print(f"{'='*60}")
    
    return result


def main():
    parser = argparse.ArgumentParser(
        description="Process Big Island VR Panoramas"
    )
    
    parser.add_argument("--all", action="store_true",
                        help="Process all locations with Street View coverage")
    parser.add_argument("--count", "-n", type=int, default=5,
                        help="Number of locations to process")
    parser.add_argument("--test", action="store_true",
                        help="Test with one location")
    parser.add_argument("--output", "-o", type=str,
                        help="Output directory")
    parser.add_argument("--no-skip", action="store_true",
                        help="Reprocess existing files")
    
    args = parser.parse_args()
    
    print_banner()
    
    # Determine paths
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    
    if args.output:
        output_base = Path(args.output)
    else:
        output_base = project_dir / "panoramas"
    
    locations_file = output_base / "locations.json"
    
    # Load locations
    if not locations_file.exists():
        print(f"\nLocations file not found: {locations_file}")
        return 1
    
    with open(locations_file) as f:
        data = json.load(f)
    
    locations = data.get("locations", [])
    print(f"\nLoaded {len(locations)} locations from database")
    
    # Find locations with Street View coverage
    print("\nChecking Street View coverage...")
    available = []
    
    for loc in locations:
        name = loc["name"]
        lat = loc["lat"]
        lng = loc["lng"]
        
        meta = get_pano_metadata(lat, lng)
        if meta:
            loc["pano_id"] = meta.get("pano_id")
            available.append(loc)
            print(f"  ✓ {name}")
        else:
            print(f"  ✗ {name} (no coverage)")
        
        if not args.all and len(available) >= args.count:
            break
    
    print(f"\n{len(available)} locations available for processing")
    
    if args.test:
        available = available[:1]
    elif not args.all:
        available = available[:args.count]
    
    # Process locations
    results = []
    successful = 0
    failed = 0
    
    for loc in available:
        result = process_location(
            name=loc["name"],
            lat=loc["lat"],
            lng=loc["lng"],
            output_base=output_base,
            skip_existing=not args.no_skip
        )
        results.append(result)
        
        if result["success"]:
            successful += 1
        else:
            failed += 1
    
    # Save results
    results_file = output_base / "processing_results.json"
    with open(results_file, "w") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total": len(results),
            "successful": successful,
            "failed": failed,
            "results": results
        }, f, indent=2)
    
    # Update locations.json with paths
    for result in results:
        if result["success"]:
            for loc in data["locations"]:
                if loc["name"] == result["name"]:
                    loc["panorama_path"] = result["panorama_path"]
                    loc["depth_path"] = result["depth_path"]
                    loc["pano_id"] = result["pano_id"]
                    loc["processed"] = True
                    break
    
    with open(locations_file, "w") as f:
        json.dump(data, f, indent=2)
    
    # Summary
    print("\n" + "=" * 70)
    print("PROCESSING SUMMARY")
    print("=" * 70)
    print(f"  Total processed: {len(results)}")
    print(f"  Successful:      {successful}")
    print(f"  Failed:          {failed}")
    print(f"  Results saved:   {results_file}")
    print("=" * 70)
    
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
