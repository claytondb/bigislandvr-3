# AI Scene Motion Pipeline

## Overview

This system adds subtle, realistic motion to 360° panoramas using GPU shaders. Instead of generating video, we animate regions in real-time based on segmentation masks.

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      Three.js Viewer                              │
├──────────────────────────────────────────────────────────────────┤
│  ShaderMaterial with custom fragment shader                       │
│    ├── Panorama texture (static image)                           │
│    ├── Sky mask → Cloud drift effect                             │
│    ├── Water mask → Wave/ripple effect                           │
│    └── Vegetation mask → Sway/rustle effect                      │
└──────────────────────────────────────────────────────────────────┘
```

## Pipeline Steps

### Step 1: Capture Panorama
**Input:** Location coordinates  
**Output:** 640x640 equirectangular panorama (or higher res)

The panoramas are captured from Google Street View or similar sources.

### Step 2: Generate Segmentation Masks
**Input:** Panorama image  
**Output:** Three grayscale masks (sky, water, vegetation)

Two approaches available:

#### A) Color-based segmentation (fast, local)
```bash
python3 fix-masks.py
```
- Uses color thresholds to detect sky (blue/bright), water (blue-green), vegetation (green)
- Applies Gaussian blur for smooth edges
- Good for most scenes, but may need manual tuning

#### B) SAM2 segmentation (more accurate, API-based)
```bash
bash run-sam2-all.sh
```
- Uses Segment Anything Model 2 via Replicate API
- More accurate region boundaries
- Requires API token and has cost (~$0.02/image)

### Step 3: Real-time Shader Animation
**Input:** Panorama + masks  
**Output:** Animated WebGL render

The shader applies per-pixel distortion based on mask values:
- **Sky/Clouds:** Slow horizontal drift with noise-based morphing
- **Water:** Multi-frequency sine waves + organic ripple noise  
- **Vegetation:** Wind sway with varying speeds + leaf rustle noise

Key shader parameters:
- `smoothstep(0.05, 0.3, mask)` - Soft edge blending
- Multi-layer noise for organic movement
- Independent intensity controls per effect type

## Files Structure

```
ai-motion/
├── panoramas/           # Source panorama images
│   ├── alii-drive.jpg
│   ├── hilo-bayfront.jpg
│   ├── punaluu-beach.jpg
│   └── keaau.jpg
├── masks/               # Segmentation masks (640x640 grayscale PNG)
│   ├── {location}-sky.png
│   ├── {location}-water.png
│   └── {location}-veg.png
├── shader-debug.html    # Debug viewer with mask outlines
├── shader-demo.html     # Clean demo without debug controls
├── shader-with-masks.html # Alternative viewer
├── fix-masks.py         # Python mask generation script
├── create-masks-local.mjs # Node.js mask generation (requires canvas)
└── shaders/
    └── animated-panorama.js # Reusable shader module
```

## Usage

### Debug Mode
Open `shader-debug.html` in a browser:
- Toggle mask outlines to verify regions
- Adjust intensity sliders for each effect
- Switch between locations
- Monitor FPS performance

### Production Integration
```javascript
// Import shader code from shaders/animated-panorama.js
// Create ShaderMaterial with panorama + mask textures
// Update time uniform in animation loop
```

## Mask Requirements

- Format: Grayscale PNG (8-bit)
- Size: Match panorama dimensions (640x640 typical)
- Values: 
  - Black (0) = No effect applied
  - White (255) = Full effect strength
  - Gray = Partial effect (smooth transitions)

## Performance Notes

- Runs at 60fps on most hardware
- Shader is GPU-accelerated
- Three texture samples per pixel (masks)
- Noise calculations are cheap (Simplex noise)

## Troubleshooting

### Effects bleeding outside regions
- Check mask alignment with panorama
- Increase mask blur for smoother edges
- Lower edge threshold in shader

### Jerky/unnatural motion
- Reduce intensity values
- Lower time multiplier in shader
- Add more noise layers at different frequencies

### Poor mask quality
- Try SAM2 for better segmentation
- Manually paint masks if needed
- Adjust color thresholds in fix-masks.py

## Cost Estimate

| Component | Cost |
|-----------|------|
| Color-based masks | Free (local) |
| SAM2 masks | ~$0.02/image |
| **Total (4 locations)** | **$0 - $0.08** |

## Future Improvements

1. Higher resolution masks for cleaner edges
2. Additional effect types (sparkle, glow)
3. Day/night cycle integration
4. Weather-responsive intensity
5. Audio-reactive motion
