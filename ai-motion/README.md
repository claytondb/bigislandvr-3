# Big Island VR - AI Scene Motion

## 🎯 Overview

Transform static 360° panoramas into living, breathing scenes with AI-generated motion.
The goal: **natural motion only** — trees swaying, clouds drifting, water rippling, grass waving. 
NO cars, NO people, just the essence of Hawaiʻi in motion.

## 📍 Target Locations

| ID | Location | Coordinates | Best Motion Elements |
|----|----------|-------------|---------------------|
| 10 | Keaʻau Town Center | 19.6222, -155.0386 | Trees swaying, clouds drifting |
| 20 | Aliʻi Drive, Kailua-Kona | 19.6400, -155.9969 | Ocean waves, palms, water reflections |
| 33 | Saddle Road Viewpoint | 19.6833, -155.4667 | Clouds over Mauna Kea, grass swaying |
| 1 | Hilo Bayfront (Liliʻuokalani Park) | 19.7235, -155.0720 | Bay water, Coconut Island view, palms |

---

## 🤖 AI Video Generation Options

### 1. **Replicate (Recommended for POC)**

| Model | Cost | Quality | Best For |
|-------|------|---------|----------|
| **Kling v2.5 Turbo Pro** | ~$0.28/5sec | ⭐⭐⭐⭐⭐ | Best all-around, cinematic motion |
| Google Veo 3.1 | ~$0.35/5sec | ⭐⭐⭐⭐⭐ | High fidelity, realistic motion |
| Stable Video Diffusion | ~$0.18/run | ⭐⭐⭐⭐ | Budget option, good quality |
| Wan 2.5 I2V | ~$0.25/5sec | ⭐⭐⭐⭐ | Good natural motion |

**Replicate Setup:**
```bash
# Sign up at https://replicate.com
# Get API token at https://replicate.com/account/api-tokens
export REPLICATE_API_TOKEN=r8_xxxxxxxxxx
```

**Free Tier:** New accounts get ~$5-10 free credits (~20-50 video generations)

### 2. **Luma AI Dream Machine**

- Web UI: https://lumalabs.ai/dream-machine
- **Free tier:** 5 free generations/day
- **API:** $0.25/video (5 sec)
- Good for natural scenes, but less control over motion type

### 3. **Runway Gen-3**

- Web UI: https://runwayml.com
- **Free tier:** 125 credits (5-6 free videos)
- **API:** $0.05/sec video
- Excellent quality but pricier for bulk generation

### 4. **Local Option: ComfyUI + AnimateDiff**

```bash
# If ComfyUI is available on Windows
# Requires: 8GB+ VRAM GPU (RTX 3060+)
# Free to run, but slower

# AnimateDiff models:
# - mm_sd_v15_v2.safetensors (motion module)
# - v3_sd15_mm.safetensors (better quality)
```

**Pros:** Free, unlimited runs, full control  
**Cons:** Requires GPU, longer setup, 2-5 min/video

---

## 🔄 Complete Pipeline

### Step 1: Capture Panoramas

```bash
# Start viewer
cd /mnt/c/Users/clayt/OneDrive/Documents/dc-bigislandvr-3
npx serve -p 3456

# Capture screenshots (in another terminal)
node ai-motion/capture-and-animate.js
```

Or manually capture via browser:
1. Open http://localhost:3456
2. Navigate to target location
3. Hide UI (press `H` or use effects panel)
4. Screenshot (built-in capture or browser screenshot)

### Step 2: Optimize Image for AI

```javascript
// Requirements for best results:
// - Resolution: 1024x576 or 1280x720 (16:9)
// - Clear, high-contrast image
// - Avoid motion blur in source
// - Crop to interesting section (not full equirectangular)
```

### Step 3: Generate Motion Video

```javascript
// Using Replicate API
const response = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${REPLICATE_API_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    // Use Kling 2.5 for best natural motion
    version: 'kwaivgi/kling-v2.5-turbo-pro',
    input: {
      image: 'base64_or_url',
      prompt: 'gentle natural motion, trees swaying in breeze, clouds drifting slowly, water rippling, no people or vehicles',
      duration: 5,  // 5 seconds
      cfg_scale: 0.5,  // Lower = more natural motion
      seed: 42  // For reproducibility
    }
  })
});
```

### Step 4: Create Seamless Loop

For truly seamless loops, you'll need post-processing:

```bash
# Option 1: FFmpeg ping-pong loop
ffmpeg -i input.mp4 -filter_complex "[0]reverse[r];[0][r]concat=n=2:v=1:a=0" output_loop.mp4

# Option 2: Cross-fade loop
ffmpeg -i input.mp4 -filter_complex "[0]split[body][pre];[pre]trim=duration=1,format=yuva420p,fade=d=1:alpha=1,setpts=PTS+(4/TB)[jt];[body][jt]overlay" seamless.mp4
```

### Step 5: Convert for Web

```bash
# Convert to WebM (better browser support)
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -an output.webm

# Or use MP4 with H.264
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 22 -an output.mp4
```

---

## 🎮 Three.js Integration

### Video Texture Loader

```javascript
// In viewer code
class VideoTextureManager {
  constructor() {
    this.videoCache = new Map();
    this.videoBasePath = 'ai-motion/output/';
  }
  
  loadVideoTexture(locationId) {
    const video = document.createElement('video');
    video.src = `${this.videoBasePath}${locationId}_motion.webm`;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    
    video.play();
    return texture;
  }
  
  // Apply to sphere geometry (for 360 view)
  applyToSphere(texture) {
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Inside out
    
    const material = new THREE.MeshBasicMaterial({
      map: texture
    });
    
    return new THREE.Mesh(geometry, material);
  }
}
```

### Toggle Between Static & Animated

```javascript
// Add to effects panel
let useAnimatedPanorama = false;

function toggleAnimatedView() {
  useAnimatedPanorama = !useAnimatedPanorama;
  
  if (useAnimatedPanorama) {
    // Load video texture for current location
    const loc = LOCATIONS[currentIndex];
    const videoTex = videoManager.loadVideoTexture(loc.id);
    scene.background = videoTex;
  } else {
    // Revert to Google Street View
    updateStreetView(LOCATIONS[currentIndex]);
  }
}
```

### Hybrid Approach (Best of Both)

```javascript
// Use Street View for navigation, video for "ambient mode"
class HybridPanoramaViewer {
  enterAmbientMode(locationId) {
    // Pause Street View
    streetViewPanorama.setVisible(false);
    
    // Show animated video
    this.animatedOverlay.style.display = 'block';
    this.playVideo(locationId);
    
    // Enable ambient audio
    audioManager.setAmbientMode(true);
  }
  
  exitAmbientMode() {
    this.animatedOverlay.style.display = 'none';
    streetViewPanorama.setVisible(true);
    audioManager.setAmbientMode(false);
  }
}
```

---

## 📋 Motion Prompt Guide

### For Natural Scenic Motion

```
✅ Good prompts:
- "gentle breeze through palm trees, subtle water ripples, drifting clouds"
- "soft wind moving grass, peaceful ocean waves, natural lighting"
- "slow cloud movement, trees swaying gently, calm water reflections"

❌ Avoid:
- "dramatic storm" (too much motion)
- "people walking" (not natural)
- "cars driving" (not the goal)
- "fast motion" (unnatural for landscapes)
```

### Per-Location Prompts

| Location | Suggested Prompt |
|----------|------------------|
| Keaʻau | "small town scene with trees swaying gently in tropical breeze, scattered clouds drifting, dappled sunlight" |
| Aliʻi Drive | "ocean waves gently lapping shore, palm fronds swaying, clouds reflecting on water, golden hour light" |
| Saddle Road | "high altitude vista, clouds rolling over volcanic slopes, grass waving in wind, dramatic sky" |
| Hilo Bayfront | "bay water rippling, coconut palms swaying, clouds over Mauna Kea, peaceful morning light" |

---

## 🚀 Quick Start

### Option A: Replicate (Fastest)

```bash
# 1. Set API token
export REPLICATE_API_TOKEN=r8_xxxxxxxxxx

# 2. Run pipeline
cd ai-motion
node capture-and-animate.js

# Output: ai-motion/output/*.mp4
```

### Option B: Manual via Web UI

1. Go to https://lumalabs.ai/dream-machine (5 free/day)
2. Upload cropped panorama section
3. Prompt: "gentle natural motion, trees swaying, clouds drifting"
4. Download result
5. Save to `ai-motion/output/`

### Option C: Bulk Generation Script

```bash
# Generate all 4 locations
for loc in keaau alii-drive saddle-road hilo-bayfront; do
  node generate-single.js --location $loc
done
```

---

## 📁 Directory Structure

```
ai-motion/
├── README.md              # This file
├── locations.json         # Target locations config
├── capture-and-animate.js # Full pipeline script
├── generate-motion.js     # Video generation module
├── download-panoramas.js  # Street View downloader
├── output/                # Generated videos
│   ├── keaau.mp4
│   ├── keaau_loop.webm
│   └── manifest.json
├── samples/               # Sample inputs/outputs
└── integration/           # Three.js integration code
```

---

## 🎯 Success Criteria

- [ ] At least 1 animated video generated successfully
- [ ] Video shows natural motion (trees, clouds, water)
- [ ] Video loops seamlessly (or near-seamlessly)
- [ ] Video can be loaded as texture in Three.js
- [ ] Total generation cost < $5 for POC

---

## 📈 Future Enhancements

1. **Upscaling:** Use Real-ESRGAN to upscale 720p → 4K
2. **Audio sync:** Match rustling sounds to tree motion
3. **Weather modes:** Generate rain, sunset, night versions
4. **Seasonal:** Different foliage colors for variety
5. **Interactive:** Mouse-responsive motion intensity

---

## 🔗 Resources

- [Replicate Documentation](https://replicate.com/docs)
- [Luma AI Dream Machine](https://lumalabs.ai/dream-machine)
- [Three.js VideoTexture](https://threejs.org/docs/#api/en/textures/VideoTexture)
- [AnimateDiff Guide](https://github.com/guoyww/AnimateDiff)
- [FFmpeg Loop Filter](https://trac.ffmpeg.org/wiki/Creating%20multiple%20outputs)
