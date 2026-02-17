# Big Island VR 3.0 - Testing Checklist

**Version**: 1.0  
**Date**: 2026-02-17  
**Purpose**: Pre-release verification and regression testing

---

## Pre-Release Checklist

### ☐ Build Verification

- [ ] index.html loads without console errors
- [ ] Three.js CDN accessible (r128)
- [ ] All panorama URLs return valid images
- [ ] No 404s in network tab
- [ ] No JavaScript exceptions on load

### ☐ Core Functionality

- [ ] Loading screen appears and fades correctly
- [ ] First panorama displays within 5 seconds
- [ ] Panorama is correctly oriented (sky up, ground down)
- [ ] Camera starts at center position (0,0)
- [ ] All 5 locations load successfully

### ☐ Navigation

- [ ] ← Arrow key: Previous location
- [ ] → Arrow key: Next location
- [ ] Space bar: Toggle auto-play
- [ ] Previous button works
- [ ] Next button works
- [ ] Auto-play button toggles correctly
- [ ] Auto-play cycles through locations
- [ ] Navigation wraps at boundaries

### ☐ Mouse/Touch Controls

- [ ] Click + drag rotates view (desktop)
- [ ] Touch + drag rotates view (mobile)
- [ ] Vertical rotation limited (no flip)
- [ ] Smooth movement without jitter
- [ ] Release stops movement (no drift)

### ☐ Transitions

- [ ] Fade transition is smooth
- [ ] Transition duration ~1.5 seconds
- [ ] No visual glitches during transition
- [ ] Cannot trigger new transition during active one
- [ ] Memory cleaned up after transition (no leaks)

### ☐ Effects Panel

- [ ] Rain toggle works (on/off)
- [ ] Rain animation visible when on
- [ ] Rain non-interactive (clicks through)
- [ ] Birds toggle visual state works
- [ ] Ocean toggle visual state works
- [ ] Wind toggle visual state works
- [ ] Toggle states logged to console

### ☐ UI Components

- [ ] Info panel visible (top-left)
- [ ] Location name updates correctly
- [ ] Location description updates correctly
- [ ] Location counter shows "X of 5"
- [ ] Effects panel visible (top-right)
- [ ] Controls bar centered (bottom)
- [ ] Keyboard hints visible

### ☐ Responsiveness

- [ ] Window resize updates canvas
- [ ] Window resize updates camera aspect
- [ ] Rain canvas resizes with window
- [ ] UI usable at 320px width
- [ ] UI usable at 1920px width
- [ ] Landscape orientation works
- [ ] Portrait orientation works

### ☐ Performance

- [ ] Maintains 30+ FPS on desktop
- [ ] Maintains 24+ FPS on mobile
- [ ] No visible frame drops during transitions
- [ ] Memory usage stable over time
- [ ] GPU not overloaded (no artifacts)

---

## Regression Test Suite

Run after any code changes.

### Quick Smoke Test (~5 min)

```
1. [ ] Load index.html
2. [ ] Wait for panorama to appear
3. [ ] Click and drag to look around
4. [ ] Press → three times (navigate forward)
5. [ ] Press ← once (navigate back)
6. [ ] Press Space (enable auto-play)
7. [ ] Wait 10 seconds (verify transitions)
8. [ ] Press Space (disable auto-play)
9. [ ] Toggle Rain on
10. [ ] Verify rain animation
11. [ ] Toggle Rain off
12. [ ] Resize window
13. [ ] Verify canvas resizes
14. [ ] Check console for errors
```

### Full Regression (~30 min)

#### Scene & Rendering

- [ ] Three.js scene initializes
- [ ] Sphere geometry correct (radius 500, inverted)
- [ ] Texture mapping correct (equirectangular)
- [ ] Camera perspective (75° FOV)
- [ ] Render loop running (60fps target)
- [ ] Anti-aliasing enabled
- [ ] Pixel ratio respected

#### Navigation Logic

- [ ] currentIndex starts at 0
- [ ] nextLocation() increments correctly
- [ ] prevLocation() decrements correctly
- [ ] Modulo wrapping works (5 → 0)
- [ ] Modulo wrapping works (-1 → 4)
- [ ] isTransitioning blocks navigation
- [ ] isTransitioning resets after completion

#### Transition System

- [ ] New texture loads before transition
- [ ] Old sphere fades out
- [ ] New sphere fades in
- [ ] Timing matches CONFIG.transitionDuration
- [ ] Easing function applied
- [ ] Old sphere disposed (geometry + material)
- [ ] No orphaned objects in scene

#### Auto-play System

- [ ] Timer starts on enable
- [ ] Timer stops on disable
- [ ] Interval matches CONFIG.autoPlayInterval
- [ ] Button text updates correctly
- [ ] Button style updates (active class)

#### Rain Effect

- [ ] Canvas initialized to window size
- [ ] 200 raindrops created
- [ ] Drops have random properties
- [ ] Animation loop only runs when active
- [ ] Drops respawn at top when exiting
- [ ] Canvas clears each frame
- [ ] Stroke style applied correctly

#### Mouse Controls

- [ ] mousedown sets isMouseDown
- [ ] mousemove updates lon/lat when down
- [ ] mouseup clears isMouseDown
- [ ] lon unlimited (full rotation)
- [ ] lat clamped to [-85, 85]
- [ ] Sensitivity multiplier applied (0.1)

#### Touch Controls

- [ ] touchstart records initial position
- [ ] touchmove calculates delta
- [ ] Single touch only (no pinch yet)
- [ ] Same sensitivity as mouse

#### Keyboard Controls

- [ ] ArrowRight → nextLocation()
- [ ] ArrowLeft → prevLocation()
- [ ] Space → toggleAutoPlay()
- [ ] Space preventDefault (no scroll)
- [ ] Other keys ignored

#### Window Events

- [ ] resize updates camera.aspect
- [ ] resize calls updateProjectionMatrix()
- [ ] resize updates renderer.setSize()
- [ ] resize updates rain canvas size

---

## Accessibility Checklist

### Keyboard Accessibility

- [ ] All buttons focusable with Tab
- [ ] Enter/Space activates buttons
- [ ] Arrow keys work without click
- [ ] No keyboard traps
- [ ] Focus order logical

### Visual Accessibility

- [ ] Info text readable (#fff on rgba black)
- [ ] Button text readable
- [ ] Toggle state visually distinct
- [ ] Active states clear
- [ ] Hover states present

### Motion Accessibility

- [ ] Auto-play off by default
- [ ] Auto-play easily toggled
- [ ] Transitions not too rapid
- [ ] No flashing content
- [ ] Rain effect can be disabled

### Screen Reader Considerations

- [ ] Add aria-labels to buttons (TODO)
- [ ] Add aria-live to info panel (TODO)
- [ ] Add role="application" to viewer (TODO)
- [ ] Add alt text descriptions (TODO)

---

## Browser-Specific Checks

### Chrome

- [ ] WebGL works
- [ ] Smooth rendering
- [ ] DevTools show no errors
- [ ] Memory stable

### Firefox

- [ ] WebGL works
- [ ] Touch events work
- [ ] CSS transitions smooth
- [ ] No rendering artifacts

### Safari

- [ ] WebGL works (may need enable)
- [ ] Touch events work
- [ ] requestAnimationFrame works
- [ ] No webkit-specific issues

### Edge

- [ ] Chromium-based (like Chrome)
- [ ] All features work
- [ ] No console errors

### Mobile Safari (iOS)

- [ ] Touch controls work
- [ ] No pinch-zoom conflicts
- [ ] Viewport correct
- [ ] No address bar issues

### Chrome Mobile (Android)

- [ ] Touch controls work
- [ ] Performance acceptable
- [ ] No memory warnings

---

## Python Scripts Checklist

### download_panoramas.py

- [ ] API key valid
- [ ] Routes defined correctly
- [ ] Metadata saved as JSON
- [ ] Images download successfully
- [ ] Error handling for missing coverage

### stitch_panorama.py

- [ ] PIL imports work
- [ ] Input directory exists check
- [ ] Output directory created
- [ ] 4 images required validation
- [ ] Output quality preserved

### upscale.py

- [ ] Real-ESRGAN import attempt
- [ ] Graceful fallback on missing dependency
- [ ] Skip existing files
- [ ] Tile processing for large images

---

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| QA Engineer | | | ☐ Pass / ☐ Fail |
| Developer | | | ☐ Reviewed |
| Project Lead | | | ☐ Approved |

---

*Checklist version 1.0. Update as features are added.*
