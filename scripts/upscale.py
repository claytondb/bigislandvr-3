"""
AI Upscale Panoramas using Real-ESRGAN

Upscales stitched panoramas to 4K+ resolution for better VR quality.
"""

import os
import subprocess
from pathlib import Path

def upscale_with_realesrgan(input_path: Path, output_path: Path, scale: int = 4):
    """
    Upscale image using Real-ESRGAN.
    
    Requires: pip install realesrgan
    Or download the executable from: https://github.com/xinntao/Real-ESRGAN
    """
    
    # Try using the Python package first
    try:
        from realesrgan import RealESRGANer
        from basicsr.archs.rrdbnet_arch import RRDBNet
        import cv2
        import numpy as np
        
        # Model setup
        model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
        upsampler = RealESRGANer(
            scale=scale,
            model_path='https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
            model=model,
            tile=400,  # Tile size for processing large images
            tile_pad=10,
            pre_pad=0,
            half=True  # Use half precision for speed
        )
        
        img = cv2.imread(str(input_path), cv2.IMREAD_UNCHANGED)
        output, _ = upsampler.enhance(img, outscale=scale)
        cv2.imwrite(str(output_path), output)
        
        return True
        
    except ImportError:
        print("Real-ESRGAN Python package not installed.")
        print("Install with: pip install realesrgan")
        print("Or use the CLI executable.")
        return False

def upscale_directory(input_dir: Path, output_dir: Path, scale: int = 4):
    """Upscale all images in a directory"""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for img_path in input_dir.glob("*.jpg"):
        output_path = output_dir / f"{img_path.stem}_4x.jpg"
        
        if output_path.exists():
            print(f"Skipping (exists): {img_path.name}")
            continue
        
        print(f"Upscaling: {img_path.name}")
        success = upscale_with_realesrgan(img_path, output_path, scale)
        
        if not success:
            print(f"  Failed to upscale {img_path.name}")

def upscale_all_routes(input_base: Path, output_base: Path):
    """Upscale all routes"""
    for route_dir in input_base.iterdir():
        if route_dir.is_dir():
            print(f"\nUpscaling route: {route_dir.name}")
            output_dir = output_base / route_dir.name
            upscale_directory(route_dir, output_dir)

if __name__ == "__main__":
    base = Path(__file__).parent.parent / "panoramas"
    input_dir = base / "stitched"
    output_dir = base / "upscaled"
    
    print("=" * 50)
    print("BIG ISLAND VR - AI UPSCALER")
    print("=" * 50)
    
    if input_dir.exists():
        upscale_all_routes(input_dir, output_dir)
    else:
        print(f"Input directory not found: {input_dir}")
        print("Run stitch_panorama.py first")
    
    print("\nDone!")
