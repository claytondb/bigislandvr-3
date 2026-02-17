# Big Island VR 3.0 - Immersive Panorama Experience

Explore the Big Island of Hawaii through AI-upscaled panoramas with depth-based transitions, spatial audio, and VR support.

## Features

### Viewer Capabilities
- 🖼️ **Equirectangular Panoramas** - Proper spherical projection for immersive viewing
- 🔄 **Depth-Based Transitions** - Parallax morphing between locations using depth maps
- 📱 **Gyroscope Support** - Look around naturally on mobile devices
- 🥽 **WebXR VR** - Full VR headset support (Quest, Vive, etc.)
- 🌧️ **Ambient Weather** - Dynamic rain and wind particle systems
- 🐦 **Spatial Audio** - Location-aware bird sounds, ocean waves, wind
- 🎯 **60fps Performance** - Optimized for smooth mobile experience

### Python Pipeline
- 🖼️ **Download** - Fetch Street View panoramas via Google API
- 🧵 **Stitch** - Combine perspective views into equirectangular
- 🔍 **Depth Estimation** - Generate depth maps with Depth Anything v2
- ⬆️ **Upscale** - AI enhance to 4K+ with Real-ESRGAN
- 🎬 **Transitions** - Generate depth-warped transition frames

## Quick Start

### View Panoramas
1. Open `index.html` in a modern browser
2. Drag to look around (or use gyroscope on mobile)
3. Arrow keys or buttons to navigate
4. Toggle weather/audio effects on the right panel

### VR Mode
- Click "🥽 Enter VR" with a connected headset
- Look around naturally
- Use controller buttons to navigate

### Mobile Gyroscope
- Tap "📱 Gyro" to enable motion controls
- iOS requires permission prompt

## Controls

| Input | Action |
|-------|--------|
| Drag / Touch | Look around |
| ← / → | Previous / Next location |
| Space | Toggle auto-play |
| F | Fullscreen |
| Scroll | Zoom in/out |

## Directory Structure

```
dc-bigislandvr-3/
├── index.html              # Main viewer (all features)
├── README.md
├── audio/                  # Ambient audio files
├── panoramas/
│   ├── original/           # Downloaded raw images
│   ├── stitched/           # Equirectangular panoramas
│   ├── depth/              # Depth maps (grayscale PNG)
│   ├── upscaled/           # AI-enhanced panoramas
│   └── transitions/        # Transition frame sequences
├── public/
│   └── depth_maps.json     # Panorama-depth mapping
├── scripts/
│   ├── requirements.txt    # Python dependencies
│   ├── download_panoramas.py
│   ├── stitch_panorama.py
│   ├── depth_estimation.py # Depth Anything v2
│   ├── generate_transitions.py
│   └── upscale.py          # Real-ESRGAN
└── docs/
```

## Python Pipeline Setup

### 1. Install Dependencies

```bash
cd scripts
pip install -r requirements.txt

# For GPU acceleration (recommended):
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

### 2. Download Panoramas

```bash
python download_panoramas.py [route_name]

# Routes: hilo_bayfront, keaau, volcano, saddle_road
# Downloads from Google Street View API
```

### 3. Stitch to Equirectangular

```bash
python stitch_panorama.py

# Combines 4-direction images into equirectangular
```

### 4. Generate Depth Maps

```bash
python depth_estimation.py [input_dir] [output_dir]

# Uses Depth Anything v2 (auto-downloads model)
# Outputs: grayscale PNG depth maps
```

### 5. AI Upscale (Optional)

```bash
python upscale.py

# Uses Real-ESRGAN for 4x upscaling
```

### 6. Generate Transitions (Optional)

```bash
python generate_transitions.py --frames 30 --mode depth_warp

# Creates depth-warped transition frames between panoramas
# Outputs: image sequences + MP4 videos
```

## Tech Stack

- **Viewer**: Three.js r152, WebGL 2.0, WebXR
- **Audio**: Howler.js with Web Audio API spatial positioning
- **Depth AI**: Depth Anything v2 (HuggingFace Transformers)
- **Upscaling**: Real-ESRGAN
- **Transitions**: OpenCV depth warping + optical flow

## Performance Targets

| Device | Target FPS | Notes |
|--------|------------|-------|
| Desktop | 60 | Full effects |
| Mobile | 60 | Reduced particles |
| VR | 72+ | Simplified shaders |

## Audio Sources

The viewer uses ambient audio from Freesound.org (Creative Commons):
- Ocean waves
- Bird songs (Hawaiian forest)
- Wind
- Rain

Replace with your own audio files in `audio/` for production.

## Browser Compatibility

| Browser | Desktop | Mobile | VR |
|---------|---------|--------|-----|
| Chrome | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ |
| Safari | ✅ | ✅ | ❌ |
| Edge | ✅ | ✅ | ✅ |

WebXR requires HTTPS in production.

## API Keys

The download script uses Google Street View API. The key in the script is rate-limited. For heavy usage, replace with your own:

```python
# scripts/download_panoramas.py
API_KEY = "your-api-key-here"
```

## License

MIT - Use freely for personal or commercial projects.

## Roadmap

- [ ] Pre-cached depth maps for demo locations
- [ ] WebGPU renderer option
- [ ] Volumetric fog effect
- [ ] Time-of-day lighting
- [ ] Hotspot navigation UI
- [ ] Offline PWA support
