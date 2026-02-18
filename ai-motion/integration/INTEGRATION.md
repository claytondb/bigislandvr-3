# Video Panorama Integration Guide

## Quick Integration

### 1. Add the Video Manager Script

Add to your `index.html` before the closing `</body>` tag:

```html
<script src="ai-motion/integration/video-panorama.js"></script>
```

### 2. Initialize in Your Code

```javascript
// After Google Maps initializes
const videoManager = new VideoPanoramaManager({
    basePath: 'ai-motion/output/'
});

// Attach to your viewer container
videoManager.attachTo(document.getElementById('street-view-container'));

// Preload videos for smooth experience
videoManager.preload([1, 10, 20, 33]);
```

### 3. Add Toggle Button

Add to your controls:

```html
<button id="video-mode-btn" class="control-btn">
    <span>🎬</span>
    <span>Live Scene</span>
</button>
```

```javascript
document.getElementById('video-mode-btn').addEventListener('click', async () => {
    const currentLoc = LOCATIONS[currentIndex];
    const isPlaying = await videoManager.toggle(currentLoc.id);
    
    const btn = document.getElementById('video-mode-btn');
    if (isPlaying) {
        btn.classList.add('active');
        btn.querySelector('span:last-child').textContent = 'Street View';
    } else {
        btn.classList.remove('active');
        btn.querySelector('span:last-child').textContent = 'Live Scene';
    }
});
```

### 4. Auto-Play on Location Change (Optional)

```javascript
// Modify your goToLocation function
function goToLocation(index) {
    // ... existing code ...
    
    // After loading Street View, check for video
    const location = LOCATIONS[index];
    if (autoPlayVideo) {
        videoManager.playLocation(location.id).then(hasVideo => {
            if (hasVideo) {
                console.log('Playing animated panorama');
            } else {
                console.log('No video available, showing Street View');
            }
        });
    }
}
```

## Video File Naming Convention

Videos should be named: `{locationId}_motion.{format}`

Examples:
- `1_motion.webm` (Hilo Bayfront)
- `10_motion.webm` (Keaʻau Town Center)
- `20_motion.webm` (Aliʻi Drive)
- `33_motion.webm` (Saddle Road)

Supported formats: `.webm` (preferred), `.mp4`

## Testing

1. Start local server:
```bash
cd /mnt/c/Users/clayt/OneDrive/Documents/dc-bigislandvr-3
npx serve -p 3456
```

2. Open http://localhost:3456

3. Click "Live Scene" button to toggle video mode

## Troubleshooting

### Video doesn't play
- Check browser console for CORS errors
- Ensure video file exists in correct location
- Verify video format is supported (WebM/MP4)

### Video looks pixelated
- Regenerate at higher resolution (1920x1080)
- Use higher quality codec settings

### Performance issues
- Reduce video resolution to 1280x720
- Use WebM VP9 codec (better compression)
- Limit simultaneous video preloads

## CSS Adjustments

The video overlay sits at z-index 5. If you have other layers, adjust accordingly:

```css
#video-panorama-overlay {
    z-index: 5;  /* Adjust if needed */
}

/* Ensure Street View container is behind */
#street-view-container {
    z-index: 1;
}
```

## Future Enhancements

1. **Blending**: Cross-fade between Street View and video
2. **Motion matching**: Sync video motion with user pan/zoom
3. **Quality selection**: Low/Medium/High video options
4. **Offline support**: Cache videos in service worker
