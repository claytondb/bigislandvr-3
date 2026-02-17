"""
Generate Depth-Warped Transitions for Big Island VR

Creates smooth transitions between panoramas using depth maps
for parallax warping. This creates a 3D "dolly" effect rather
than a simple crossfade.

Usage:
    python generate_transitions.py [panoramas_dir] [output_dir] [--frames N]

Output:
    - Image sequences for each transition
    - Optional: MP4 video files
"""

import os
import sys
import json
from pathlib import Path
from typing import List, Tuple, Optional
import numpy as np
from PIL import Image
import cv2

# Progress
try:
    from tqdm import tqdm
    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False
    tqdm = lambda x, **kw: x


# Configuration
DEFAULT_FRAMES = 30  # 1 second at 30fps
TRANSITION_MODE = "depth_warp"  # "depth_warp", "crossfade", "morph"


def load_image_pair(pano1_path: Path, pano2_path: Path) -> Tuple[np.ndarray, np.ndarray]:
    """Load two panorama images as numpy arrays"""
    img1 = np.array(Image.open(pano1_path).convert("RGB"))
    img2 = np.array(Image.open(pano2_path).convert("RGB"))
    return img1, img2


def load_depth_pair(
    depth1_path: Path,
    depth2_path: Path
) -> Tuple[np.ndarray, np.ndarray]:
    """Load two depth maps as numpy arrays"""
    depth1 = np.array(Image.open(depth1_path).convert("L"))
    depth2 = np.array(Image.open(depth2_path).convert("L"))
    return depth1, depth2


def depth_warp(
    image: np.ndarray,
    depth: np.ndarray,
    displacement: float,
    direction: str = "forward"
) -> np.ndarray:
    """
    Warp an image using depth-based displacement.
    
    Creates a parallax effect where near objects move more than far objects.
    
    Args:
        image: RGB image (H, W, 3)
        depth: Depth map (H, W), 0=far, 255=near
        displacement: Amount of displacement (0-1)
        direction: "forward" or "backward"
    
    Returns:
        warped_image: Warped RGB image
    """
    h, w = depth.shape
    
    # Normalize depth to 0-1
    depth_norm = depth.astype(np.float32) / 255.0
    
    # Invert so far=0, near=1 (near objects should move more)
    depth_factor = 1.0 - depth_norm
    
    # Create displacement field
    # Near objects move more, far objects move less
    max_shift = displacement * w * 0.05  # Max 5% of width
    
    if direction == "backward":
        max_shift = -max_shift
    
    # Horizontal displacement based on depth
    shift_x = (depth_factor * max_shift).astype(np.float32)
    
    # Also add slight vertical parallax for realism
    shift_y = (depth_factor * max_shift * 0.3).astype(np.float32)
    
    # Create mesh grid
    y_coords, x_coords = np.meshgrid(np.arange(h), np.arange(w), indexing='ij')
    
    # Apply displacement
    map_x = (x_coords + shift_x).astype(np.float32)
    map_y = (y_coords + shift_y).astype(np.float32)
    
    # Clamp to valid range
    map_x = np.clip(map_x, 0, w - 1)
    map_y = np.clip(map_y, 0, h - 1)
    
    # Remap image
    warped = cv2.remap(
        image,
        map_x,
        map_y,
        interpolation=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_REPLICATE
    )
    
    return warped


def generate_transition_frames(
    img1: np.ndarray,
    img2: np.ndarray,
    depth1: np.ndarray,
    depth2: np.ndarray,
    num_frames: int,
    mode: str = "depth_warp"
) -> List[np.ndarray]:
    """
    Generate transition frames between two panoramas.
    
    Args:
        img1, img2: Source and destination images
        depth1, depth2: Corresponding depth maps
        num_frames: Number of intermediate frames
        mode: Transition mode
    
    Returns:
        frames: List of transition frame arrays
    """
    frames = []
    
    for i in range(num_frames):
        # Progress from 0 to 1
        t = i / (num_frames - 1)
        
        # Ease in-out cubic
        if t < 0.5:
            eased = 4 * t * t * t
        else:
            eased = 1 - pow(-2 * t + 2, 3) / 2
        
        if mode == "crossfade":
            # Simple crossfade
            frame = cv2.addWeighted(img1, 1 - eased, img2, eased, 0)
            
        elif mode == "depth_warp":
            # Depth-warped transition with parallax
            
            # Warp source image forward (into the screen)
            warped1 = depth_warp(img1, depth1, eased, direction="forward")
            
            # Warp destination image backward (from behind)
            warped2 = depth_warp(img2, depth2, 1 - eased, direction="backward")
            
            # Blend with vignette for smoother transition
            alpha = create_transition_mask(img1.shape[:2], eased)
            
            # Composite
            frame = (warped1 * (1 - alpha[:, :, np.newaxis]) + 
                    warped2 * alpha[:, :, np.newaxis]).astype(np.uint8)
            
        elif mode == "morph":
            # Optical flow-based morph (more expensive)
            frame = morph_transition(img1, img2, eased)
            
        else:
            frame = img1 if t < 0.5 else img2
        
        frames.append(frame)
    
    return frames


def create_transition_mask(
    shape: Tuple[int, int],
    progress: float,
    style: str = "fade"
) -> np.ndarray:
    """
    Create a transition mask for blending.
    
    Args:
        shape: (height, width)
        progress: 0-1 transition progress
        style: "fade", "wipe", "radial"
    
    Returns:
        mask: Float array (H, W) with values 0-1
    """
    h, w = shape
    
    if style == "fade":
        # Simple uniform fade
        return np.full((h, w), progress, dtype=np.float32)
        
    elif style == "wipe":
        # Left-to-right wipe
        x = np.linspace(0, 1, w)
        mask_1d = np.clip((x - progress + 0.1) / 0.2, 0, 1)
        return np.tile(mask_1d, (h, 1)).astype(np.float32)
        
    elif style == "radial":
        # Radial reveal from center
        y, x = np.ogrid[:h, :w]
        cx, cy = w / 2, h / 2
        dist = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        max_dist = np.sqrt(cx ** 2 + cy ** 2)
        dist_norm = dist / max_dist
        
        # Expand from center
        mask = np.clip((progress * 1.5 - dist_norm + 0.1) / 0.2, 0, 1)
        return mask.astype(np.float32)
    
    return np.full((h, w), progress, dtype=np.float32)


def morph_transition(
    img1: np.ndarray,
    img2: np.ndarray,
    t: float
) -> np.ndarray:
    """
    Create a morph transition using optical flow.
    More expensive but can produce smoother results for similar scenes.
    """
    # Convert to grayscale for flow calculation
    gray1 = cv2.cvtColor(img1, cv2.COLOR_RGB2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_RGB2GRAY)
    
    # Calculate optical flow
    flow = cv2.calcOpticalFlowFarneback(
        gray1, gray2, None,
        pyr_scale=0.5, levels=3, winsize=15,
        iterations=3, poly_n=5, poly_sigma=1.2, flags=0
    )
    
    h, w = gray1.shape
    
    # Create coordinate grids
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    
    # Interpolated coordinates
    map_x1 = x + flow[:, :, 0] * t
    map_y1 = y + flow[:, :, 1] * t
    
    map_x2 = x - flow[:, :, 0] * (1 - t)
    map_y2 = y - flow[:, :, 1] * (1 - t)
    
    # Warp both images toward the middle
    warped1 = cv2.remap(img1, map_x1, map_y1, cv2.INTER_LINEAR)
    warped2 = cv2.remap(img2, map_x2, map_y2, cv2.INTER_LINEAR)
    
    # Blend
    return cv2.addWeighted(warped1, 1 - t, warped2, t, 0)


def save_frames(
    frames: List[np.ndarray],
    output_dir: Path,
    base_name: str,
    format: str = "jpg"
):
    """Save frames as image sequence"""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for i, frame in enumerate(frames):
        filename = f"{base_name}_{i:04d}.{format}"
        filepath = output_dir / filename
        
        # Convert RGB to BGR for OpenCV
        frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        
        if format.lower() in ['jpg', 'jpeg']:
            cv2.imwrite(str(filepath), frame_bgr, [cv2.IMWRITE_JPEG_QUALITY, 95])
        else:
            cv2.imwrite(str(filepath), frame_bgr)


def frames_to_video(
    frames: List[np.ndarray],
    output_path: Path,
    fps: int = 30
):
    """Convert frames to MP4 video"""
    try:
        import imageio
        
        # imageio expects RGB
        with imageio.get_writer(
            str(output_path),
            fps=fps,
            codec='libx264',
            quality=8,
            pixelformat='yuv420p'
        ) as writer:
            for frame in frames:
                writer.append_data(frame)
        
        print(f"  Video saved: {output_path}")
        
    except ImportError:
        print("  imageio not installed, skipping video generation")
        print("  Install with: pip install imageio imageio-ffmpeg")


def find_transition_pairs(panoramas_dir: Path, depth_dir: Path) -> List[dict]:
    """
    Find pairs of panoramas that should have transitions.
    Uses metadata.json if available, otherwise pairs sequentially.
    """
    pairs = []
    
    # Check for metadata
    metadata_path = panoramas_dir / "metadata.json"
    if metadata_path.exists():
        with open(metadata_path) as f:
            locations = json.load(f)
        
        # Create pairs from sequential locations
        for i in range(len(locations) - 1):
            loc1 = locations[i]
            loc2 = locations[i + 1]
            
            # Find corresponding files
            pano1 = find_panorama(panoramas_dir, loc1.get('pano_id', loc1.get('name')))
            pano2 = find_panorama(panoramas_dir, loc2.get('pano_id', loc2.get('name')))
            
            if pano1 and pano2:
                depth1 = find_depth(depth_dir, pano1.stem)
                depth2 = find_depth(depth_dir, pano2.stem)
                
                if depth1 and depth2:
                    pairs.append({
                        'name': f"{loc1.get('name', 'loc1')}_to_{loc2.get('name', 'loc2')}",
                        'pano1': pano1,
                        'pano2': pano2,
                        'depth1': depth1,
                        'depth2': depth2
                    })
    else:
        # Pair files sequentially by name
        pano_files = sorted([
            f for f in panoramas_dir.glob("*.jpg")
            if '_depth' not in f.stem
        ])
        
        for i in range(len(pano_files) - 1):
            pano1 = pano_files[i]
            pano2 = pano_files[i + 1]
            
            depth1 = find_depth(depth_dir, pano1.stem)
            depth2 = find_depth(depth_dir, pano2.stem)
            
            if depth1 and depth2:
                pairs.append({
                    'name': f"{pano1.stem}_to_{pano2.stem}",
                    'pano1': pano1,
                    'pano2': pano2,
                    'depth1': depth1,
                    'depth2': depth2
                })
    
    return pairs


def find_panorama(directory: Path, identifier: str) -> Optional[Path]:
    """Find a panorama file by identifier"""
    for ext in ['.jpg', '.jpeg', '.png', '.webp']:
        # Try exact match
        path = directory / f"{identifier}{ext}"
        if path.exists():
            return path
        
        # Try with _equirect suffix
        path = directory / f"{identifier}_equirect{ext}"
        if path.exists():
            return path
        
        # Try partial match
        for f in directory.glob(f"*{identifier}*{ext}"):
            if '_depth' not in f.stem:
                return f
    
    return None


def find_depth(depth_dir: Path, pano_stem: str) -> Optional[Path]:
    """Find a depth map for a panorama"""
    # Try direct match
    depth_path = depth_dir / f"{pano_stem}_depth.png"
    if depth_path.exists():
        return depth_path
    
    # Try without suffix
    base_name = pano_stem.replace('_equirect', '').replace('_4x', '')
    depth_path = depth_dir / f"{base_name}_depth.png"
    if depth_path.exists():
        return depth_path
    
    return None


def generate_all_transitions(
    panoramas_dir: Path,
    depth_dir: Path,
    output_dir: Path,
    num_frames: int = DEFAULT_FRAMES,
    make_video: bool = True,
    mode: str = TRANSITION_MODE
):
    """Generate transitions for all panorama pairs"""
    
    pairs = find_transition_pairs(panoramas_dir, depth_dir)
    
    if not pairs:
        print("No valid panorama pairs found.")
        print("Ensure you have:")
        print("  1. Panorama images in the panoramas directory")
        print("  2. Corresponding depth maps (run depth_estimation.py)")
        return
    
    print(f"\nFound {len(pairs)} transition pairs")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for pair in tqdm(pairs, desc="Generating transitions"):
        print(f"\n{pair['name']}")
        
        try:
            # Load images and depth maps
            img1, img2 = load_image_pair(pair['pano1'], pair['pano2'])
            depth1, depth2 = load_depth_pair(pair['depth1'], pair['depth2'])
            
            # Resize depth to match image if needed
            if depth1.shape != img1.shape[:2]:
                depth1 = cv2.resize(depth1, (img1.shape[1], img1.shape[0]))
            if depth2.shape != img2.shape[:2]:
                depth2 = cv2.resize(depth2, (img2.shape[1], img2.shape[0]))
            
            # Generate frames
            frames = generate_transition_frames(
                img1, img2, depth1, depth2,
                num_frames=num_frames,
                mode=mode
            )
            
            # Save as image sequence
            seq_dir = output_dir / "sequences" / pair['name']
            save_frames(frames, seq_dir, pair['name'])
            print(f"  Saved {len(frames)} frames")
            
            # Save as video
            if make_video:
                video_path = output_dir / "videos" / f"{pair['name']}.mp4"
                video_path.parent.mkdir(parents=True, exist_ok=True)
                frames_to_video(frames, video_path)
            
        except Exception as e:
            print(f"  Error: {e}")
            continue


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Generate depth-warped transitions between panoramas"
    )
    parser.add_argument(
        "panoramas_dir",
        nargs="?",
        help="Directory containing panorama images"
    )
    parser.add_argument(
        "output_dir",
        nargs="?",
        help="Output directory for transitions"
    )
    parser.add_argument(
        "--depth-dir",
        help="Directory containing depth maps (default: panoramas/depth)"
    )
    parser.add_argument(
        "--frames",
        type=int,
        default=DEFAULT_FRAMES,
        help=f"Number of transition frames (default: {DEFAULT_FRAMES})"
    )
    parser.add_argument(
        "--no-video",
        action="store_true",
        help="Skip video generation"
    )
    parser.add_argument(
        "--mode",
        choices=["depth_warp", "crossfade", "morph"],
        default=TRANSITION_MODE,
        help=f"Transition mode (default: {TRANSITION_MODE})"
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("BIG ISLAND VR - TRANSITION GENERATOR")
    print("=" * 60)
    
    # Default paths
    project_root = Path(__file__).parent.parent
    panoramas_dir = Path(args.panoramas_dir) if args.panoramas_dir else \
                    project_root / "panoramas" / "stitched"
    depth_dir = Path(args.depth_dir) if args.depth_dir else \
                project_root / "panoramas" / "depth"
    output_dir = Path(args.output_dir) if args.output_dir else \
                 project_root / "panoramas" / "transitions"
    
    # Validate
    if not panoramas_dir.exists():
        print(f"\nPanorama directory not found: {panoramas_dir}")
        return 1
    
    if not depth_dir.exists():
        print(f"\nDepth directory not found: {depth_dir}")
        print("Run depth_estimation.py first")
        return 1
    
    # Generate
    generate_all_transitions(
        panoramas_dir,
        depth_dir,
        output_dir,
        num_frames=args.frames,
        make_video=not args.no_video,
        mode=args.mode
    )
    
    print("\n" + "=" * 60)
    print("DONE!")
    print("=" * 60)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
