#!/usr/bin/env python3
"""
Full AI Enhancement Pipeline for Big Island VR

Downloads Street View tiles → Stitches → Upscales with Real-ESRGAN → Depth map with Depth Anything v2

Usage:
    python full_pipeline.py --lat 19.7260 --lng -155.0820 --name "Banyan Drive"
    python full_pipeline.py --pano-id CAoSK0FGM... --name "Custom Location"
    python full_pipeline.py --config locations.json --location "Kilauea Overlook"
"""

import os
import sys
import json
import argparse
import requests
import logging
import hashlib
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, asdict
from typing import Optional, Tuple, List, Dict, Any
from PIL import Image
import numpy as np

# ============================================================================
# Configuration
# ============================================================================

API_KEY = "AIzaSyBmSDHrsQunVjxhZ4UHQ0asdUY6vZVFszY"
STREETVIEW_URL = "https://maps.googleapis.com/maps/api/streetview"
METADATA_URL = "https://maps.googleapis.com/maps/api/streetview/metadata"

# Pipeline settings
DEFAULT_TILE_SIZE = 640  # Max Street View API size
DEFAULT_OUTPUT_WIDTH = 8192  # 8K equirectangular
DEFAULT_UPSCALE_FACTOR = 4
DEPTH_MODEL_ID = "depth-anything/Depth-Anything-V2-Small-hf"

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)


@dataclass
class PipelineResult:
    """Result of processing a single location"""
    success: bool
    location_name: str
    pano_id: Optional[str] = None
    panorama_path: Optional[str] = None
    upscaled_path: Optional[str] = None
    depth_path: Optional[str] = None
    error: Optional[str] = None
    processing_time_seconds: float = 0.0
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


class StreetViewDownloader:
    """Downloads Street View tiles and stitches into equirectangular panoramas"""
    
    def __init__(self, api_key: str = API_KEY):
        self.api_key = api_key
        self.session = requests.Session()
    
    def get_pano_metadata(self, lat: float, lng: float, radius: int = 50) -> Optional[Dict]:
        """Get panorama metadata for a location"""
        params = {
            "location": f"{lat},{lng}",
            "radius": radius,
            "key": self.api_key,
            "source": "outdoor"  # Prefer outdoor panoramas
        }
        
        try:
            resp = self.session.get(METADATA_URL, params=params, timeout=10)
            data = resp.json()
            
            if data.get("status") == "OK":
                return data
            else:
                logger.warning(f"No Street View at ({lat}, {lng}): {data.get('status')}")
                return None
        except Exception as e:
            logger.error(f"Failed to get metadata: {e}")
            return None
    
    def get_pano_by_id(self, pano_id: str) -> Optional[Dict]:
        """Get metadata for a specific panorama ID"""
        params = {
            "pano": pano_id,
            "key": self.api_key
        }
        
        try:
            resp = self.session.get(METADATA_URL, params=params, timeout=10)
            data = resp.json()
            
            if data.get("status") == "OK":
                return data
            return None
        except Exception as e:
            logger.error(f"Failed to get pano metadata: {e}")
            return None
    
    def download_tiles(self, pano_id: str, output_dir: Path, 
                       tile_size: int = DEFAULT_TILE_SIZE) -> List[Path]:
        """
        Download all tiles needed for a full equirectangular panorama.
        
        Street View API returns perspective views, so we download at multiple
        headings and pitches to cover the full sphere.
        """
        output_dir.mkdir(parents=True, exist_ok=True)
        tiles = []
        
        # Cover full sphere: 360° horizontal, ~180° vertical
        # Using 90° FOV, we need 4 horizontal × 3 vertical = 12 images minimum
        headings = [0, 60, 120, 180, 240, 300]  # 6 directions for better overlap
        pitches = [-45, 0, 45]  # Look down, level, up
        
        for heading in headings:
            for pitch in pitches:
                params = {
                    "pano": pano_id,
                    "size": f"{tile_size}x{tile_size}",
                    "heading": heading,
                    "pitch": pitch,
                    "fov": 90,
                    "key": self.api_key
                }
                
                url = f"{STREETVIEW_URL}?" + "&".join(f"{k}={v}" for k, v in params.items())
                
                try:
                    resp = self.session.get(url, timeout=30)
                    
                    if resp.status_code == 200 and len(resp.content) > 1000:
                        filename = f"tile_h{heading:03d}_p{pitch:+03d}.jpg"
                        filepath = output_dir / filename
                        
                        with open(filepath, "wb") as f:
                            f.write(resp.content)
                        
                        tiles.append(filepath)
                        logger.debug(f"Downloaded: {filename}")
                    else:
                        logger.warning(f"Failed tile h={heading} p={pitch}: status={resp.status_code}")
                        
                except Exception as e:
                    logger.error(f"Failed to download tile h={heading} p={pitch}: {e}")
        
        logger.info(f"Downloaded {len(tiles)} tiles")
        return tiles
    
    def stitch_equirectangular(self, tiles_dir: Path, output_path: Path,
                               output_width: int = 4096) -> bool:
        """
        Stitch downloaded tiles into an equirectangular panorama.
        
        This uses a simplified planar projection approach.
        For production, consider using PTGui or Hugin for better stitching.
        """
        output_height = output_width // 2  # 2:1 aspect for equirectangular
        
        # Load all tiles
        tiles = sorted(tiles_dir.glob("tile_*.jpg"))
        if not tiles:
            logger.error("No tiles found to stitch")
            return False
        
        # Create output canvas
        result = Image.new('RGB', (output_width, output_height), (128, 128, 128))
        
        # Parse tiles and map to equirectangular coordinates
        for tile_path in tiles:
            # Parse filename: tile_h{heading}_p{pitch}.jpg
            name = tile_path.stem
            parts = name.split("_")
            heading = int(parts[1][1:])  # h000 -> 0
            pitch = int(parts[2][1:])    # p+00 -> 0
            
            try:
                img = Image.open(tile_path)
                
                # Map heading (0-360) to x position (0 to width)
                # heading 0 = center, heading 180 = edges
                center_x = int((heading / 360) * output_width)
                
                # Map pitch (-90 to 90) to y position
                # pitch 90 = top, pitch -90 = bottom, pitch 0 = middle
                center_y = int(((90 - pitch) / 180) * output_height)
                
                # Calculate tile dimensions in output
                fov_h_pixels = int((90 / 360) * output_width)
                fov_v_pixels = int((90 / 180) * output_height)
                
                # Resize tile
                tile_resized = img.resize((fov_h_pixels, fov_v_pixels), Image.LANCZOS)
                
                # Calculate paste position (centered on heading/pitch point)
                paste_x = center_x - fov_h_pixels // 2
                paste_y = center_y - fov_v_pixels // 2
                
                # Handle wrap-around for heading
                if paste_x < 0:
                    # Tile wraps from right side
                    result.paste(tile_resized, (paste_x + output_width, paste_y))
                if paste_x + fov_h_pixels > output_width:
                    # Tile wraps to left side
                    result.paste(tile_resized, (paste_x - output_width, paste_y))
                
                result.paste(tile_resized, (paste_x, paste_y))
                
            except Exception as e:
                logger.warning(f"Failed to process tile {tile_path.name}: {e}")
        
        # Save result
        output_path.parent.mkdir(parents=True, exist_ok=True)
        result.save(output_path, quality=95, optimize=True)
        logger.info(f"Saved stitched panorama: {output_path}")
        
        return True


class AIUpscaler:
    """Upscales images using Real-ESRGAN"""
    
    def __init__(self, scale: int = 4):
        self.scale = scale
        self.upsampler = None
        self._initialized = False
    
    def _ensure_initialized(self):
        """Lazy initialization of the model"""
        if self._initialized:
            return True
        
        try:
            import torch
            from realesrgan import RealESRGANer
            from basicsr.archs.rrdbnet_arch import RRDBNet
            
            # Determine device
            if torch.cuda.is_available():
                device = 'cuda'
                half = True
            else:
                device = 'cpu'
                half = False
            
            logger.info(f"Initializing Real-ESRGAN on {device}")
            
            # Model architecture
            model = RRDBNet(
                num_in_ch=3, num_out_ch=3, num_feat=64, 
                num_block=23, num_grow_ch=32, scale=4
            )
            
            # Model weights URL
            model_url = 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth'
            
            self.upsampler = RealESRGANer(
                scale=self.scale,
                model_path=model_url,
                model=model,
                tile=400,  # Process in tiles to save memory
                tile_pad=10,
                pre_pad=0,
                half=half,
                device=device
            )
            
            self._initialized = True
            return True
            
        except ImportError as e:
            logger.error(f"Real-ESRGAN not installed: {e}")
            logger.error("Install with: pip install realesrgan basicsr")
            return False
        except Exception as e:
            logger.error(f"Failed to initialize Real-ESRGAN: {e}")
            return False
    
    def upscale(self, input_path: Path, output_path: Path) -> bool:
        """Upscale an image file"""
        if not self._ensure_initialized():
            return False
        
        try:
            import cv2
            
            img = cv2.imread(str(input_path), cv2.IMREAD_UNCHANGED)
            if img is None:
                logger.error(f"Failed to read image: {input_path}")
                return False
            
            logger.info(f"Upscaling {input_path.name} ({img.shape[1]}x{img.shape[0]} → {img.shape[1]*self.scale}x{img.shape[0]*self.scale})")
            
            output, _ = self.upsampler.enhance(img, outscale=self.scale)
            
            output_path.parent.mkdir(parents=True, exist_ok=True)
            cv2.imwrite(str(output_path), output)
            
            logger.info(f"Saved upscaled image: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Upscaling failed: {e}")
            return False


class DepthEstimator:
    """Generates depth maps using Depth Anything v2"""
    
    def __init__(self, model_id: str = DEPTH_MODEL_ID):
        self.model_id = model_id
        self.processor = None
        self.model = None
        self.device = None
        self._initialized = False
    
    def _ensure_initialized(self):
        """Lazy initialization of the model"""
        if self._initialized:
            return True
        
        try:
            import torch
            from transformers import AutoImageProcessor, AutoModelForDepthEstimation
            
            # Determine device
            if torch.cuda.is_available():
                self.device = 'cuda'
            elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
                self.device = 'mps'
            else:
                self.device = 'cpu'
            
            logger.info(f"Loading Depth Anything v2 on {self.device}")
            
            self.processor = AutoImageProcessor.from_pretrained(self.model_id)
            self.model = AutoModelForDepthEstimation.from_pretrained(self.model_id)
            self.model = self.model.to(self.device)
            self.model.eval()
            
            self._initialized = True
            return True
            
        except ImportError as e:
            logger.error(f"Transformers not installed: {e}")
            logger.error("Install with: pip install transformers torch")
            return False
        except Exception as e:
            logger.error(f"Failed to initialize depth model: {e}")
            return False
    
    def estimate(self, input_path: Path, output_path: Path) -> bool:
        """Generate depth map for an image"""
        if not self._ensure_initialized():
            return False
        
        try:
            import torch
            
            # Load image
            image = Image.open(input_path).convert('RGB')
            original_size = image.size
            
            logger.info(f"Estimating depth for {input_path.name} ({original_size[0]}x{original_size[1]})")
            
            # Process
            inputs = self.processor(images=image, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                predicted_depth = outputs.predicted_depth
            
            # Interpolate to original size
            prediction = torch.nn.functional.interpolate(
                predicted_depth.unsqueeze(1),
                size=(original_size[1], original_size[0]),
                mode="bicubic",
                align_corners=False
            ).squeeze()
            
            # Normalize to 0-255
            depth_np = prediction.cpu().numpy()
            depth_min, depth_max = depth_np.min(), depth_np.max()
            depth_normalized = (depth_np - depth_min) / (depth_max - depth_min + 1e-8)
            depth_normalized = (depth_normalized * 255).astype(np.uint8)
            
            # Save
            output_path.parent.mkdir(parents=True, exist_ok=True)
            depth_image = Image.fromarray(depth_normalized, mode='L')
            depth_image.save(output_path, optimize=True)
            
            logger.info(f"Saved depth map: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Depth estimation failed: {e}")
            return False


class FullPipeline:
    """
    Complete panorama processing pipeline.
    
    Steps:
    1. Download Street View tiles
    2. Stitch into equirectangular panorama
    3. Upscale with Real-ESRGAN (4x)
    4. Generate depth map with Depth Anything v2
    """
    
    def __init__(self, output_base: Path, 
                 upscale_factor: int = DEFAULT_UPSCALE_FACTOR,
                 skip_existing: bool = True):
        self.output_base = Path(output_base)
        self.upscale_factor = upscale_factor
        self.skip_existing = skip_existing
        
        # Initialize components
        self.downloader = StreetViewDownloader()
        self.upscaler = AIUpscaler(scale=upscale_factor)
        self.depth_estimator = DepthEstimator()
        
        # Create output directories
        self.tiles_dir = self.output_base / "tiles"
        self.stitched_dir = self.output_base / "stitched"
        self.upscaled_dir = self.output_base / "upscaled"
        self.depth_dir = self.output_base / "depth"
        self.processed_dir = self.output_base / "processed"
        
        for d in [self.tiles_dir, self.stitched_dir, self.upscaled_dir, 
                  self.depth_dir, self.processed_dir]:
            d.mkdir(parents=True, exist_ok=True)
    
    def _get_location_id(self, name: str, lat: float = None, lng: float = None, 
                         pano_id: str = None) -> str:
        """Generate a unique ID for a location"""
        if pano_id:
            return pano_id[:12]
        
        # Hash from name + coordinates
        key = f"{name}_{lat}_{lng}"
        return hashlib.md5(key.encode()).hexdigest()[:12]
    
    def process_location(self, name: str, lat: float = None, lng: float = None,
                         pano_id: str = None, description: str = "") -> PipelineResult:
        """
        Process a single location through the full pipeline.
        
        Args:
            name: Location name
            lat, lng: Coordinates (optional if pano_id provided)
            pano_id: Specific panorama ID (optional)
            description: Location description
        
        Returns:
            PipelineResult with paths to generated files
        """
        start_time = datetime.now()
        
        logger.info("=" * 60)
        logger.info(f"Processing: {name}")
        if lat and lng:
            logger.info(f"Coordinates: ({lat}, {lng})")
        if pano_id:
            logger.info(f"Panorama ID: {pano_id}")
        logger.info("=" * 60)
        
        # Step 1: Get panorama metadata
        logger.info("\n[Step 1/4] Getting Street View metadata...")
        
        if pano_id:
            metadata = self.downloader.get_pano_by_id(pano_id)
        elif lat and lng:
            metadata = self.downloader.get_pano_metadata(lat, lng)
        else:
            return PipelineResult(
                success=False,
                location_name=name,
                error="Must provide either coordinates (lat/lng) or panorama ID"
            )
        
        if not metadata:
            return PipelineResult(
                success=False,
                location_name=name,
                error="No Street View coverage found"
            )
        
        pano_id = metadata.get("pano_id")
        actual_lat = metadata.get("location", {}).get("lat", lat)
        actual_lng = metadata.get("location", {}).get("lng", lng)
        
        logger.info(f"Found panorama: {pano_id}")
        
        # Generate location ID
        loc_id = self._get_location_id(name, actual_lat, actual_lng, pano_id)
        
        # Define output paths
        tiles_path = self.tiles_dir / loc_id
        stitched_path = self.stitched_dir / f"{loc_id}_pano.jpg"
        upscaled_path = self.upscaled_dir / f"{loc_id}_4x.jpg"
        depth_path = self.depth_dir / f"{loc_id}_depth.png"
        
        # Check if already processed
        final_pano = self.processed_dir / f"{loc_id}_panorama.jpg"
        final_depth = self.processed_dir / f"{loc_id}_depth.png"
        
        if self.skip_existing and final_pano.exists() and final_depth.exists():
            logger.info("Location already processed, skipping...")
            processing_time = (datetime.now() - start_time).total_seconds()
            return PipelineResult(
                success=True,
                location_name=name,
                pano_id=pano_id,
                panorama_path=str(final_pano),
                depth_path=str(final_depth),
                processing_time_seconds=processing_time,
                metadata={
                    "lat": actual_lat,
                    "lng": actual_lng,
                    "description": description,
                    "skipped": True
                }
            )
        
        # Step 2: Download tiles
        logger.info("\n[Step 2/4] Downloading Street View tiles...")
        
        if not tiles_path.exists() or not list(tiles_path.glob("*.jpg")):
            tiles = self.downloader.download_tiles(pano_id, tiles_path)
            if not tiles:
                return PipelineResult(
                    success=False,
                    location_name=name,
                    pano_id=pano_id,
                    error="Failed to download tiles"
                )
        else:
            logger.info(f"Using existing tiles in {tiles_path}")
        
        # Step 3: Stitch panorama
        logger.info("\n[Step 3/4] Stitching equirectangular panorama...")
        
        if not stitched_path.exists():
            if not self.downloader.stitch_equirectangular(tiles_path, stitched_path):
                return PipelineResult(
                    success=False,
                    location_name=name,
                    pano_id=pano_id,
                    error="Failed to stitch panorama"
                )
        else:
            logger.info(f"Using existing stitched panorama: {stitched_path}")
        
        # Step 4: Upscale with Real-ESRGAN
        logger.info("\n[Step 4/4a] Upscaling with Real-ESRGAN...")
        
        if not upscaled_path.exists():
            if not self.upscaler.upscale(stitched_path, upscaled_path):
                # Continue with un-upscaled version
                logger.warning("Upscaling failed, using original resolution")
                upscaled_path = stitched_path
        else:
            logger.info(f"Using existing upscaled image: {upscaled_path}")
        
        # Step 5: Generate depth map
        logger.info("\n[Step 4/4b] Generating depth map with Depth Anything v2...")
        
        if not depth_path.exists():
            if not self.depth_estimator.estimate(upscaled_path, depth_path):
                return PipelineResult(
                    success=False,
                    location_name=name,
                    pano_id=pano_id,
                    panorama_path=str(upscaled_path),
                    error="Failed to generate depth map"
                )
        else:
            logger.info(f"Using existing depth map: {depth_path}")
        
        # Copy final outputs to processed directory
        import shutil
        shutil.copy2(upscaled_path, final_pano)
        shutil.copy2(depth_path, final_depth)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info("\n" + "=" * 60)
        logger.info("✓ Processing complete!")
        logger.info(f"  Panorama: {final_pano}")
        logger.info(f"  Depth:    {final_depth}")
        logger.info(f"  Time:     {processing_time:.1f}s")
        logger.info("=" * 60)
        
        return PipelineResult(
            success=True,
            location_name=name,
            pano_id=pano_id,
            panorama_path=str(final_pano),
            upscaled_path=str(upscaled_path),
            depth_path=str(final_depth),
            processing_time_seconds=processing_time,
            metadata={
                "lat": actual_lat,
                "lng": actual_lng,
                "description": description,
                "date_captured": metadata.get("date", ""),
                "copyright": metadata.get("copyright", "")
            }
        )


def main():
    parser = argparse.ArgumentParser(
        description="Full AI Enhancement Pipeline for Big Island VR",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    # Process by coordinates
    python full_pipeline.py --lat 19.7260 --lng -155.0820 --name "Banyan Drive"
    
    # Process by panorama ID
    python full_pipeline.py --pano-id CAoSK0FGMVFpcE... --name "Kilauea"
    
    # Process from config file
    python full_pipeline.py --config locations.json --location "Hilo Bayfront"
        """
    )
    
    parser.add_argument("--lat", type=float, help="Latitude")
    parser.add_argument("--lng", type=float, help="Longitude")
    parser.add_argument("--name", type=str, default="Location", help="Location name")
    parser.add_argument("--description", type=str, default="", help="Description")
    parser.add_argument("--pano-id", type=str, help="Specific panorama ID")
    parser.add_argument("--output", type=str, help="Output directory")
    parser.add_argument("--config", type=str, help="JSON config file with locations")
    parser.add_argument("--location", type=str, help="Location name from config")
    parser.add_argument("--no-skip", action="store_true", help="Reprocess existing files")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Determine output directory
    if args.output:
        output_base = Path(args.output)
    else:
        output_base = Path(__file__).parent.parent / "panoramas"
    
    # Initialize pipeline
    pipeline = FullPipeline(
        output_base=output_base,
        skip_existing=not args.no_skip
    )
    
    # Process from config file
    if args.config:
        config_path = Path(args.config)
        if not config_path.exists():
            # Check relative to script
            config_path = Path(__file__).parent.parent / "panoramas" / args.config
        
        if not config_path.exists():
            logger.error(f"Config file not found: {args.config}")
            return 1
        
        with open(config_path) as f:
            config = json.load(f)
        
        locations = config.get("locations", [])
        
        if args.location:
            # Process single location from config
            loc = next((l for l in locations if l["name"] == args.location), None)
            if not loc:
                logger.error(f"Location not found in config: {args.location}")
                return 1
            
            result = pipeline.process_location(
                name=loc["name"],
                lat=loc.get("lat"),
                lng=loc.get("lng"),
                pano_id=loc.get("pano_id"),
                description=loc.get("description", "")
            )
            
            if not result.success:
                logger.error(f"Failed: {result.error}")
                return 1
        else:
            logger.error("Specify --location when using --config")
            return 1
    
    # Process by coordinates or pano ID
    elif args.lat and args.lng:
        result = pipeline.process_location(
            name=args.name,
            lat=args.lat,
            lng=args.lng,
            description=args.description
        )
        
        if not result.success:
            logger.error(f"Failed: {result.error}")
            return 1
    
    elif args.pano_id:
        result = pipeline.process_location(
            name=args.name,
            pano_id=args.pano_id,
            description=args.description
        )
        
        if not result.success:
            logger.error(f"Failed: {result.error}")
            return 1
    
    else:
        parser.print_help()
        return 1
    
    # Print result summary
    print("\n" + json.dumps(asdict(result), indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
