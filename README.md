# Big Island VR 3.0 - Enhanced Panorama Experience

Explore the Big Island of Hawaii through AI-upscaled panoramas with smooth transitions and ambient effects.

## Features

- 🖼️ **AI-Upscaled Panoramas** - Street View images enhanced to 4K via Real-ESRGAN
- 🔄 **Smooth Transitions** - Depth-based morphing between waypoints
- 🌧️ **Ambient Effects** - Rain, wind, birds, volumetric fog
- 🔊 **Spatial Audio** - Location-based ambient soundscapes
- 🎮 **Easy Navigation** - Arrow keys, auto-play, or VR teleport

## Tech Stack

- **Viewer**: Three.js + WebGL
- **Upscaling**: Real-ESRGAN
- **Depth**: Depth Anything v2
- **Transitions**: FILM frame interpolation + depth warping
- **Audio**: Howler.js with spatial positioning

## Quick Start

1. Open `index.html` in a browser
2. Use arrow keys to navigate between panoramas
3. Toggle effects with on-screen controls

## Directory Structure

```
dc-bigislandvr-3/
├── index.html          # Main viewer
├── panoramas/          # Processed panoramas (equirectangular)
│   ├── original/       # Raw Street View downloads
│   ├── upscaled/       # 4K AI-upscaled versions
│   └── depth/          # Depth maps
├── audio/              # Ambient sound files
│   ├── ocean.mp3
│   ├── rain.mp3
│   ├── birds.mp3
│   └── wind.mp3
├── scripts/            # Processing scripts
│   ├── download_route.py
│   ├── upscale.py
│   └── estimate_depth.py
└── public/             # Static assets
```

## Routes

- **Hilo Bayfront** - Banyan Drive to downtown
- **Keaau Town** - Main intersection area
- **Chain of Craters** - Volcanoes National Park
- **Saddle Road** - Between the mountains

## Roadmap

- [x] Basic panorama viewer
- [x] Smooth fade transitions
- [ ] Depth-based parallax transitions
- [ ] AI frame interpolation
- [ ] Rain/wind particle effects
- [ ] Ambient audio system
- [ ] VR mode (WebXR)
- [ ] Unity/Quest port

---

*Bringing the Big Island home* 🌴
