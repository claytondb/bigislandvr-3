"""
Stitch Street View images into equirectangular panoramas

Takes the 4-direction images downloaded from Street View API
and stitches them into a single equirectangular panorama.
"""

import os
import json
from pathlib import Path
from PIL import Image
import numpy as np

def stitch_four_views(images: list, output_size=(4096, 2048)) -> Image.Image:
    """
    Stitch 4 perspective views (0, 90, 180, 270 degrees) into equirectangular.
    
    This is a simplified approach - for production, use proper projection math.
    """
    # For now, just place them side by side as a placeholder
    # A proper implementation would use cylindrical/spherical projection
    
    width = output_size[0] // 4
    height = output_size[1]
    
    result = Image.new('RGB', output_size)
    
    for i, img_path in enumerate(sorted(images)):
        img = Image.open(img_path)
        img = img.resize((width, height), Image.LANCZOS)
        result.paste(img, (i * width, 0))
    
    return result

def process_location(location_dir: Path, output_dir: Path):
    """Process all images for a location into equirectangular panoramas"""
    
    # Group images by pano_id
    pano_groups = {}
    for img_path in location_dir.glob("*.jpg"):
        # Parse filename: {pano_id}_h{heading}_p{pitch}.jpg
        parts = img_path.stem.split("_")
        pano_id = parts[0]
        
        if pano_id not in pano_groups:
            pano_groups[pano_id] = []
        pano_groups[pano_id].append(img_path)
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for pano_id, images in pano_groups.items():
        print(f"Stitching {pano_id} ({len(images)} images)")
        
        if len(images) < 4:
            print(f"  Skipping - need 4 images, got {len(images)}")
            continue
        
        result = stitch_four_views(images)
        output_path = output_dir / f"{pano_id}_equirect.jpg"
        result.save(output_path, quality=95)
        print(f"  Saved: {output_path}")

def process_all_routes(input_base: Path, output_base: Path):
    """Process all routes"""
    for route_dir in input_base.iterdir():
        if route_dir.is_dir():
            print(f"\nProcessing route: {route_dir.name}")
            output_dir = output_base / route_dir.name
            process_location(route_dir, output_dir)

if __name__ == "__main__":
    base = Path(__file__).parent.parent / "panoramas"
    input_dir = base / "original"
    output_dir = base / "stitched"
    
    print("=" * 50)
    print("BIG ISLAND VR - PANORAMA STITCHER")
    print("=" * 50)
    
    if input_dir.exists():
        process_all_routes(input_dir, output_dir)
    else:
        print(f"Input directory not found: {input_dir}")
        print("Run download_panoramas.py first")
    
    print("\nDone!")
