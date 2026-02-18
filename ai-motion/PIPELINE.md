# AI Scene Motion Pipeline

## Goal
Make 360° panoramas feel alive by animating:
1. **Water** (ripples, waves, reflections) - Priority 1
2. **Clouds** (drifting, morphing) - Priority 2  
3. **Trees/Leaves** (swaying, rustling) - Priority 3

Keep everything else static (buildings, roads, people, cars).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Three.js Viewer                          │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: Animated Video Texture (water/clouds/trees only)      │
│           ↓ blended with mask                                   │
│  Layer 1: Static Panorama Texture (full scene)                  │
└─────────────────────────────────────────────────────────────────┘
```

## Pipeline Steps

### Step 1: Capture Panorama
**Input:** Location coordinates (lat/lng/heading)
**Output:** Equirectangular panorama image (4096x2048 ideally)

Options:
- A) Google Street View Static API (requires API key, $7/1000 requests)
- B) Puppeteer capture from our viewer (may have CORS issues)
- C) Manual capture using browser dev tools

For POC, using browser capture or manual screenshots.

### Step 2: Segment Elements
**Input:** Panorama image
**Output:** Masks for water, sky/clouds, vegetation

Using Replicate models:
- `facebook/sam-2` - Segment Anything Model 2
- Or simpler: color-based segmentation for sky (blue), water (blue-green), trees (green)

```bash
# Example using SAM2 on Replicate
curl -X POST https://api.replicate.com/v1/predictions \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  -d '{
    "version": "...",
    "input": {
      "image": "https://...",
      "points": [[x1,y1], [x2,y2]],  # Click points for water, sky, trees
      "labels": [1, 1, 1]
    }
  }'
```

### Step 3: Generate Motion Video
**Input:** Panorama image + masks
**Output:** Video with motion in masked regions only

Approach A: Full video generation, then mask
1. Generate full scene video with SVD
2. Use mask to extract only water/clouds/trees
3. Make non-masked areas transparent

Approach B: Inpaint-style generation
1. Use video inpainting model
2. Only regenerate masked regions
3. Better edge blending

### Step 4: Create Looping Video
**Input:** Generated video
**Output:** Seamless loop (3-5 seconds)

```bash
# Create seamless loop with crossfade
ffmpeg -i input.mp4 -filter_complex \
  "[0:v]split[v1][v2]; \
   [v1]trim=0:2.5[a]; \
   [v2]trim=2.5:5,setpts=PTS-STARTPTS[b]; \
   [b][a]xfade=transition=fade:duration=0.5" \
  -c:v libx264 loop.mp4
```

### Step 5: Convert for Three.js
**Input:** Looping video
**Output:** WebM with alpha channel (or MP4 + separate alpha)

```bash
# Convert to WebM with transparency
ffmpeg -i motion.mp4 -i mask.mp4 \
  -filter_complex "[0:v][1:v]alphamerge" \
  -c:v libvpx-vp9 -pix_fmt yuva420p \
  output_with_alpha.webm
```

### Step 6: Integrate in Viewer
Three.js video texture with blending:

```javascript
// Create video element
const video = document.createElement('video');
video.src = 'motion-overlay.webm';
video.loop = true;
video.muted = true;

// Create video texture
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;

// Create overlay material with additive blending
const overlayMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 0.5
});

// Add to scene as slightly smaller sphere inside panorama
const overlayGeometry = new THREE.SphereGeometry(499, 60, 40);
const overlayMesh = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlayMesh);
```

## Cost Estimate (per location)
- Street View API: ~$0.007
- SAM2 segmentation: ~$0.02
- Video generation: ~$0.05-0.10
- **Total: ~$0.10-0.15 per location**

## Files Structure
```
ai-motion/
├── panoramas/           # Captured Street View images
│   ├── keaau.png
│   ├── alii-drive.png
│   └── ...
├── masks/               # Segmentation masks
│   ├── keaau-water.png
│   ├── keaau-sky.png
│   └── ...
├── videos/              # Generated motion videos
│   ├── keaau-motion.webm
│   └── ...
└── output/              # Final composited files
    └── ...
```
