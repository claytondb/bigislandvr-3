"""
Depth Estimation for Big Island VR

Uses Depth Anything v2 to generate depth maps from panorama images.
Depth maps enable parallax effects during transitions and 6DoF viewing.

Usage:
    python depth_estimation.py [input_dir] [output_dir]
    
Output:
    - Grayscale depth maps saved alongside panoramas
    - Normalized to 0-255 range (near=dark, far=bright)
"""

import os
import sys
import json
from pathlib import Path
from typing import Optional, Tuple
import numpy as np
from PIL import Image

# Progress display
try:
    from rich.console import Console
    from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
    console = Console()
    HAS_RICH = True
except ImportError:
    HAS_RICH = False
    console = None

# Depth Anything v2 model
MODEL_ID = "depth-anything/Depth-Anything-V2-Small-hf"  # Options: Small, Base, Large
DEVICE = None  # Auto-detect


def get_device():
    """Get the best available device for inference"""
    global DEVICE
    if DEVICE is not None:
        return DEVICE
    
    import torch
    
    if torch.cuda.is_available():
        DEVICE = "cuda"
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        DEVICE = "mps"
    else:
        DEVICE = "cpu"
    
    print(f"Using device: {DEVICE}")
    return DEVICE


def load_model():
    """Load Depth Anything v2 model"""
    from transformers import AutoImageProcessor, AutoModelForDepthEstimation
    import torch
    
    device = get_device()
    
    print(f"Loading model: {MODEL_ID}")
    processor = AutoImageProcessor.from_pretrained(MODEL_ID)
    model = AutoModelForDepthEstimation.from_pretrained(MODEL_ID)
    model = model.to(device)
    model.eval()
    
    return processor, model


def estimate_depth(
    image: Image.Image,
    processor,
    model,
    output_size: Optional[Tuple[int, int]] = None
) -> np.ndarray:
    """
    Estimate depth from an image using Depth Anything v2.
    
    Args:
        image: PIL Image (equirectangular panorama)
        processor: HuggingFace image processor
        model: Depth Anything v2 model
        output_size: Optional (width, height) for output depth map
    
    Returns:
        depth_map: numpy array (H, W) with depth values 0-255
    """
    import torch
    
    device = get_device()
    
    # Preserve original size
    original_size = image.size  # (width, height)
    
    # Process image
    inputs = processor(images=image, return_tensors="pt")
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    # Inference
    with torch.no_grad():
        outputs = model(**inputs)
        predicted_depth = outputs.predicted_depth
    
    # Interpolate to original size
    prediction = torch.nn.functional.interpolate(
        predicted_depth.unsqueeze(1),
        size=(original_size[1], original_size[0]),  # (height, width)
        mode="bicubic",
        align_corners=False
    ).squeeze()
    
    # Convert to numpy and normalize to 0-255
    depth_np = prediction.cpu().numpy()
    
    # Normalize: invert so near objects are dark, far objects are bright
    # This matches typical depth map conventions
    depth_min = depth_np.min()
    depth_max = depth_np.max()
    depth_normalized = (depth_np - depth_min) / (depth_max - depth_min + 1e-8)
    depth_normalized = (depth_normalized * 255).astype(np.uint8)
    
    # Resize if needed
    if output_size and output_size != original_size:
        depth_img = Image.fromarray(depth_normalized)
        depth_img = depth_img.resize(output_size, Image.LANCZOS)
        depth_normalized = np.array(depth_img)
    
    return depth_normalized


def process_panorama(
    input_path: Path,
    output_path: Path,
    processor,
    model,
    force: bool = False
) -> bool:
    """
    Process a single panorama and save depth map.
    
    Args:
        input_path: Path to input panorama image
        output_path: Path to save depth map
        processor: Image processor
        model: Depth model
        force: Overwrite existing files
    
    Returns:
        success: Whether processing succeeded
    """
    # Skip if exists
    if output_path.exists() and not force:
        print(f"  Skipping (exists): {output_path.name}")
        return True
    
    try:
        # Load image
        image = Image.open(input_path).convert("RGB")
        
        # Estimate depth
        depth_map = estimate_depth(image, processor, model)
        
        # Save as grayscale PNG (lossless)
        depth_image = Image.fromarray(depth_map, mode='L')
        
        # Ensure output directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save depth map
        depth_image.save(output_path, optimize=True)
        
        return True
        
    except Exception as e:
        print(f"  Error processing {input_path.name}: {e}")
        return False


def process_directory(
    input_dir: Path,
    output_dir: Path,
    processor,
    model,
    force: bool = False
):
    """Process all panoramas in a directory"""
    
    # Find all image files
    image_extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    images = [
        f for f in input_dir.iterdir()
        if f.is_file() and f.suffix.lower() in image_extensions
    ]
    
    if not images:
        print(f"No images found in {input_dir}")
        return
    
    print(f"\nProcessing {len(images)} images from {input_dir.name}")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    success_count = 0
    
    for img_path in images:
        # Output path: same name with _depth suffix
        output_name = f"{img_path.stem}_depth.png"
        output_path = output_dir / output_name
        
        print(f"Processing: {img_path.name}")
        
        if process_panorama(img_path, output_path, processor, model, force):
            success_count += 1
            print(f"  Saved: {output_name}")
    
    print(f"\nCompleted: {success_count}/{len(images)} images")


def process_all_routes(
    base_dir: Path,
    output_base: Path,
    processor,
    model,
    force: bool = False
):
    """Process all route directories"""
    
    # Look for route subdirectories
    route_dirs = [d for d in base_dir.iterdir() if d.is_dir()]
    
    if not route_dirs:
        # Process base_dir directly
        process_directory(base_dir, output_base, processor, model, force)
    else:
        for route_dir in sorted(route_dirs):
            output_dir = output_base / route_dir.name
            process_directory(route_dir, output_dir, processor, model, force)


def generate_depth_json(depth_dir: Path, panoramas_dir: Path, output_path: Path):
    """
    Generate a JSON file mapping panoramas to their depth maps.
    Used by the web viewer.
    """
    depth_files = list(depth_dir.rglob("*_depth.png"))
    
    mappings = {}
    
    for depth_file in depth_files:
        # Extract panorama name
        pano_name = depth_file.stem.replace("_depth", "")
        
        # Find corresponding panorama
        for ext in ['.jpg', '.jpeg', '.png', '.webp']:
            pano_file = depth_file.parent.parent / "panoramas" / f"{pano_name}{ext}"
            if pano_file.exists():
                mappings[pano_name] = {
                    "panorama": str(pano_file.relative_to(panoramas_dir.parent)),
                    "depth": str(depth_file.relative_to(depth_dir.parent))
                }
                break
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(mappings, f, indent=2)
    
    print(f"\nGenerated depth mapping: {output_path}")
    print(f"  {len(mappings)} panoramas with depth maps")


def main():
    """Main entry point"""
    
    print("=" * 60)
    print("BIG ISLAND VR - DEPTH ESTIMATION")
    print("Using Depth Anything v2")
    print("=" * 60)
    
    # Default paths
    project_root = Path(__file__).parent.parent
    default_input = project_root / "panoramas" / "stitched"
    default_output = project_root / "panoramas" / "depth"
    
    # Parse args
    input_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else default_input
    output_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else default_output
    
    # Check input
    if not input_dir.exists():
        print(f"\nInput directory not found: {input_dir}")
        print("Options:")
        print("  1. Run stitch_panorama.py first")
        print("  2. Provide a different input path:")
        print(f"     python {Path(__file__).name} <input_dir> [output_dir]")
        return 1
    
    # Load model
    print("\n" + "-" * 40)
    try:
        processor, model = load_model()
    except Exception as e:
        print(f"\nFailed to load model: {e}")
        print("\nInstall requirements:")
        print("  pip install torch torchvision transformers")
        return 1
    
    print("-" * 40)
    
    # Process
    process_all_routes(input_dir, output_dir, processor, model)
    
    # Generate JSON mapping
    json_path = project_root / "public" / "depth_maps.json"
    generate_depth_json(output_dir, input_dir.parent, json_path)
    
    print("\n" + "=" * 60)
    print("DONE!")
    print("=" * 60)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
