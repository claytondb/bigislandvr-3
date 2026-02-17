# Big Island VR 3.0 - Known Issues

**Version**: 1.0  
**Date**: 2026-02-17  
**QA Engineer**: AI QA Agent

---

## Issue Severity Ratings

| Rating | Definition |
|--------|------------|
| 🔴 **Critical** | App broken, cannot use core features |
| 🟠 **High** | Major feature broken, workaround possible |
| 🟡 **Medium** | Feature partially broken, minor impact |
| 🟢 **Low** | Cosmetic, nice-to-fix |
| ⚪ **Enhancement** | Not a bug, feature request |

---

## Active Issues

### BIVR-001: Placeholder Images Not True Panoramas
**Severity**: 🟠 High  
**Component**: Panorama Content  
**Status**: Open

**Description**:  
The LOCATIONS array uses Unsplash images as panorama sources. These are standard photographs, not equirectangular panoramas. The viewer displays them but they don't wrap correctly.

**Steps to Reproduce**:
1. Load index.html
2. Rotate view 180+ degrees
3. Observe image distortion/seams

**Expected**: Seamless 360° panoramic view  
**Actual**: Flat image stretched on sphere with visible distortion

**Impact**: Demo-only quality. Real Street View panoramas needed.

**Suggested Fix**:  
Run the download pipeline to get actual equirectangular panoramas:
```bash
python scripts/download_panoramas.py
python scripts/stitch_panorama.py
python scripts/upscale.py
```

---

### BIVR-002: Audio System Not Implemented
**Severity**: 🟡 Medium  
**Component**: Audio  
**Status**: Open

**Description**:  
The UI shows Birds, Ocean, Wind, and Rain audio toggles, but no actual audio is implemented. The toggles only log to console.

**Steps to Reproduce**:
1. Load index.html
2. Toggle "Birds" or "Ocean" (shown as ON by default)
3. Listen for audio

**Expected**: Ambient audio plays  
**Actual**: No audio, only console.log output

**Impact**: Ambient atmosphere missing. UI suggests functionality that doesn't exist.

**Suggested Fix**:
1. Add audio files to `/audio/` directory
2. Integrate Howler.js as mentioned in README
3. Wire up toggle switches to audio playback

```javascript
// Example implementation
import { Howl } from 'howler';
const sounds = {
  birds: new Howl({ src: ['audio/birds.mp3'], loop: true }),
  ocean: new Howl({ src: ['audio/ocean.mp3'], loop: true })
};

// In toggle handler
if (effect === 'birds' && isOn) sounds.birds.play();
```

---

### BIVR-003: Wind Effect Not Implemented
**Severity**: 🟢 Low  
**Component**: Visual Effects  
**Status**: Open

**Description**:  
Wind toggle exists in UI but has no visual effect. Unlike rain which has a canvas animation, wind does nothing.

**Steps to Reproduce**:
1. Load index.html
2. Toggle "Wind" on
3. Observe scene

**Expected**: Some wind visualization (particles, blur, etc.)  
**Actual**: No change, only console log

**Suggested Fix**:
- Add subtle camera shake/sway
- Add particle system for leaves/debris
- Add wind audio (ties into BIVR-002)

---

### BIVR-004: Location Data Mismatch
**Severity**: 🟢 Low  
**Component**: Data  
**Status**: Open

**Description**:  
LOCATIONS array has 5 entries but location IDs are 1-5, while the counter shows "Location X of 10" in the HTML (hardcoded). Also, LOCATIONS.length shows 5.

**Steps to Reproduce**:
1. Load index.html
2. Check initial counter text: "Location 1 of 10"
3. Navigate and watch counter

**Expected**: Counter matches actual location count  
**Actual**: Counter hardcoded to 10 in HTML, updates correctly via JS

**Impact**: Momentary visual glitch on load before JS updates.

**Suggested Fix**:
Change HTML from:
```html
<div id="location-counter">Location 1 of 10</div>
```
To:
```html
<div id="location-counter">Loading...</div>
```

---

### BIVR-005: No Error Handling for Failed Texture Load
**Severity**: 🟠 High  
**Component**: Error Handling  
**Status**: Open

**Description**:  
If a panorama texture fails to load (network error, 404, etc.), there's no error handler. The loading screen would never hide, and the user sees infinite spinner.

**Steps to Reproduce**:
1. Disconnect network
2. Load index.html
3. Wait

**Expected**: Error message displayed, fallback behavior  
**Actual**: Infinite loading spinner

**Suggested Fix**:
```javascript
textureLoader.load(
  location.panorama,
  (texture) => { /* success handler */ },
  (progress) => { /* progress handler */ },
  (error) => {
    console.error('Failed to load panorama:', error);
    document.getElementById('loading').innerHTML = `
      <h1>🌴 Big Island VR</h1>
      <p style="color: #e53e3e;">Failed to load panorama</p>
      <button onclick="location.reload()">Retry</button>
    `;
  }
);
```

---

### BIVR-006: Memory Leak on Rapid Navigation
**Severity**: 🟡 Medium  
**Component**: Memory Management  
**Status**: Open

**Description**:  
While transitions do dispose of old spheres, rapid navigation attempts during transitions could potentially queue multiple textures loading simultaneously. The transition blocking helps but textures still load.

**Steps to Reproduce**:
1. Rapidly press → key many times
2. Monitor memory in DevTools
3. Observe texture loading in Network tab

**Expected**: Only one texture loads at a time  
**Actual**: Multiple textures may start loading

**Impact**: Bandwidth waste, potential memory pressure

**Suggested Fix**:
Add a loading queue or abort previous loads:
```javascript
let pendingLoad = null;

function loadPanorama(location, isFirst = false) {
  if (pendingLoad) {
    // Cancel or ignore pending load
    pendingLoad.cancelled = true;
  }
  
  const loadContext = { cancelled: false };
  pendingLoad = loadContext;
  
  textureLoader.load(location.panorama, (texture) => {
    if (loadContext.cancelled) {
      texture.dispose();
      return;
    }
    // ... rest of handler
  });
}
```

---

### BIVR-007: Touch Events Don't Prevent Default
**Severity**: 🟢 Low  
**Component**: Mobile  
**Status**: Open

**Description**:  
Touch event handlers don't call `preventDefault()`, which could cause page scrolling or other unintended behavior on some mobile browsers.

**Steps to Reproduce**:
1. Open on mobile device
2. Drag on panorama
3. May see address bar appear/hide or page bounce

**Suggested Fix**:
```javascript
function onTouchStart(e) {
  e.preventDefault();
  if (e.touches.length === 1) {
    // ...
  }
}

function onTouchMove(e) {
  e.preventDefault();
  // ...
}
```

Add `{ passive: false }` to event listeners:
```javascript
renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
```

---

### BIVR-008: No Pinch-to-Zoom Support
**Severity**: ⚪ Enhancement  
**Component**: Mobile  
**Status**: Open

**Description**:  
Only single-touch rotation is implemented. No pinch-to-zoom for FOV adjustment.

**Impact**: Users expect pinch gestures on mobile

**Suggested Implementation**:
```javascript
let initialPinchDistance = 0;
let initialFOV = 75;

function onTouchStart(e) {
  if (e.touches.length === 2) {
    initialPinchDistance = getPinchDistance(e.touches);
    initialFOV = camera.fov;
  }
}

function onTouchMove(e) {
  if (e.touches.length === 2) {
    const distance = getPinchDistance(e.touches);
    const scale = initialPinchDistance / distance;
    camera.fov = Math.max(30, Math.min(120, initialFOV * scale));
    camera.updateProjectionMatrix();
  }
}

function getPinchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
```

---

### BIVR-009: Auto-play Timer Not Cleared on Manual Navigation
**Severity**: 🟢 Low  
**Component**: Navigation  
**Status**: Open

**Description**:  
When auto-play is active and user manually navigates, the timer isn't reset. This can cause unexpected quick transition after manual navigation.

**Steps to Reproduce**:
1. Enable auto-play
2. Wait 2 seconds
3. Manually press →
4. Observe: next auto transition in ~3 seconds instead of 5

**Suggested Fix**:
```javascript
function goToLocation(index) {
  // Reset auto-play timer on manual navigation
  if (isAutoPlaying) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(nextLocation, CONFIG.autoPlayInterval);
  }
  // ... rest of function
}
```

---

### BIVR-010: Keyboard Hints Not Responsive
**Severity**: 🟢 Low  
**Component**: UI/Mobile  
**Status**: Open

**Description**:  
Keyboard hints shown at bottom ("← → Navigate") are not useful on mobile/touch devices where there's no keyboard.

**Suggested Fix**:
```javascript
// Detect touch device and hide hints
if ('ontouchstart' in window) {
  document.getElementById('hints').style.display = 'none';
}
```

Or show touch-specific hints:
```html
<div id="hints-desktop">...</div>
<div id="hints-mobile" style="display:none">Swipe to look • Tap buttons to navigate</div>
```

---

### BIVR-011: API Key Exposed in Python Scripts
**Severity**: 🟠 High  
**Component**: Security  
**Status**: Open

**Description**:  
Google Maps API key is hardcoded in `scripts/download_panoramas.py`:
```python
API_KEY = "AIzaSyBmSDHrsQunVjxhZ4UHQ0asdUY6vZVFszY"
```

**Impact**: API key could be abused if repo is public.

**Suggested Fix**:
1. Use environment variables
2. Add `.env` file (gitignored)
3. Update script:
```python
import os
API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')
if not API_KEY:
    raise ValueError("Set GOOGLE_MAPS_API_KEY environment variable")
```

---

### BIVR-012: Stitching Script Produces Low Quality Output
**Severity**: 🟡 Medium  
**Component**: Pipeline  
**Status**: Open

**Description**:  
`stitch_panorama.py` uses a simplified approach that just places 4 images side by side. This doesn't produce proper equirectangular projection.

**Impact**: Stitched panoramas won't look correct in viewer.

**Suggested Fix**:
- Use proper cylindrical-to-equirectangular projection math
- Consider using Hugin or similar stitching library
- Or use Google's direct equirectangular tile download

---

## Resolved Issues

*No resolved issues yet.*

---

## Issue Statistics

| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟠 High | 3 |
| 🟡 Medium | 3 |
| 🟢 Low | 5 |
| ⚪ Enhancement | 1 |
| **Total** | **12** |

---

*Last updated: 2026-02-17*
