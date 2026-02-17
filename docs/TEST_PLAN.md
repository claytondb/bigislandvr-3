# Big Island VR 3.0 - Test Plan

**Version**: 1.0  
**Date**: 2026-02-17  
**QA Engineer**: AI QA Agent  
**Project**: Big Island VR 3.0 - Enhanced Panorama Experience

---

## 1. Overview

This test plan covers all features of Big Island VR 3.0, a Three.js-based panoramic VR viewer for exploring the Big Island of Hawaii.

### 1.1 Scope
- Panorama viewer functionality
- Navigation controls (keyboard, mouse, touch)
- Transition effects between locations
- Ambient effects (rain, toggles)
- UI components and responsiveness
- Performance metrics
- Cross-browser compatibility
- Mobile device testing
- VR headset compatibility (future)

### 1.2 Test Environment
- **Frontend**: index.html (single-page application)
- **Framework**: Three.js r128 (CDN)
- **Assets**: External images (Unsplash), placeholder panoramas
- **Audio**: Planned (currently stub implementations)

---

## 2. Test Cases

### 2.1 Core Viewer (TC-CORE)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| TC-CORE-001 | Initial Load | Open index.html | Loading screen appears with spinner, then fades to panorama | P0 |
| TC-CORE-002 | Panorama Render | Wait for load complete | 360° panorama displayed correctly, camera at center | P0 |
| TC-CORE-003 | Scene Initialization | Check Three.js scene | Scene, camera, renderer properly initialized | P0 |
| TC-CORE-004 | Canvas Sizing | Load page | Canvas fills viewport (100vw x 100vh) | P0 |
| TC-CORE-005 | Loading Overlay Hide | After texture loads | Loading overlay fades with opacity transition | P1 |

### 2.2 Navigation Controls (TC-NAV)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| TC-NAV-001 | Mouse Look - Drag | Click and drag on panorama | Camera rotates following mouse movement | P0 |
| TC-NAV-002 | Mouse Look - Limits | Drag vertically to extremes | Latitude clamped to ±85° (no flip) | P0 |
| TC-NAV-003 | Arrow Right | Press → key | Navigate to next location with transition | P0 |
| TC-NAV-004 | Arrow Left | Press ← key | Navigate to previous location with transition | P0 |
| TC-NAV-005 | Space Bar | Press Space | Toggle auto-play mode | P0 |
| TC-NAV-006 | Previous Button | Click "⬅️ Previous" | Navigate to previous location | P0 |
| TC-NAV-007 | Next Button | Click "Next ➡️" | Navigate to next location | P0 |
| TC-NAV-008 | Play/Pause Button | Click "▶️ Auto Play" | Toggle auto-play, button text changes | P0 |
| TC-NAV-009 | Touch Drag | Touch and drag on mobile | Camera rotates following finger movement | P0 |
| TC-NAV-010 | Wrap Around Forward | Navigate past last location | Wraps to first location (index modulo) | P1 |
| TC-NAV-011 | Wrap Around Back | Navigate before first location | Wraps to last location | P1 |

### 2.3 Transitions (TC-TRANS)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| TC-TRANS-001 | Fade Transition | Navigate to new location | Smooth crossfade over 1500ms | P0 |
| TC-TRANS-002 | Transition Blocking | Click Next rapidly | Multiple transitions blocked during active transition | P0 |
| TC-TRANS-003 | Easing Curve | Observe transition | Ease-out cubic easing applied | P1 |
| TC-TRANS-004 | Sphere Cleanup | Complete transition | Old sphere removed from scene, resources disposed | P1 |
| TC-TRANS-005 | Auto-play Timing | Enable auto-play | Transitions every 5000ms | P1 |

### 2.4 Rain Effect (TC-RAIN)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| TC-RAIN-001 | Rain Toggle On | Click Rain toggle | Rain canvas becomes visible (opacity: 1) | P0 |
| TC-RAIN-002 | Rain Toggle Off | Click Rain toggle again | Rain canvas hidden (opacity: 0) | P0 |
| TC-RAIN-003 | Rain Animation | With rain on, observe | Raindrops animate downward | P1 |
| TC-RAIN-004 | Rain Respawn | Wait for drops to exit | Drops respawn at top with random X | P2 |
| TC-RAIN-005 | Rain Canvas Resize | Resize window with rain on | Rain canvas resizes to match viewport | P1 |
| TC-RAIN-006 | Rain Non-interactive | Try to click through rain | pointer-events: none allows clicks through | P1 |

### 2.5 Effect Toggles (TC-FX)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| TC-FX-001 | Toggle Visual State | Click any toggle | Toggle switch animates to on/off state | P1 |
| TC-FX-002 | Birds Default On | Load page | Birds toggle shows "on" state by default | P1 |
| TC-FX-003 | Ocean Default On | Load page | Ocean toggle shows "on" state by default | P1 |
| TC-FX-004 | Rain Default Off | Load page | Rain toggle shows "off" state by default | P1 |
| TC-FX-005 | Wind Default Off | Load page | Wind toggle shows "off" state by default | P1 |
| TC-FX-006 | Console Logging | Toggle any effect | Effect state logged to console | P2 |

### 2.6 UI Components (TC-UI)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| TC-UI-001 | Info Panel Display | Load any location | Location name, description, counter visible | P0 |
| TC-UI-002 | Info Panel Update | Navigate to new location | Info panel updates with new location data | P0 |
| TC-UI-003 | Location Counter | Navigate through all | Counter shows "Location X of 5" correctly | P1 |
| TC-UI-004 | Effects Panel | Load page | Effects panel visible in top-right corner | P1 |
| TC-UI-005 | Controls Bar | Load page | Control buttons centered at bottom | P1 |
| TC-UI-006 | Keyboard Hints | Load page | Keyboard hints visible above controls | P2 |
| TC-UI-007 | Z-Index Layering | Load page | UI overlays above panorama, below nothing | P1 |

### 2.7 Responsiveness (TC-RESP)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| TC-RESP-001 | Window Resize | Resize browser window | Canvas resizes, camera aspect updates | P0 |
| TC-RESP-002 | Mobile Portrait | View on phone portrait | All UI elements visible, usable | P0 |
| TC-RESP-003 | Mobile Landscape | View on phone landscape | Full immersive experience | P0 |
| TC-RESP-004 | Tablet | View on tablet | UI scales appropriately | P1 |
| TC-RESP-005 | 4K Display | View on 4K monitor | High-res rendering, readable UI | P1 |

---

## 3. Browser Compatibility Matrix

### 3.1 Desktop Browsers

| Browser | Version | WebGL | Three.js | Rain Canvas | Status |
|---------|---------|-------|----------|-------------|--------|
| Chrome | 90+ | ✅ | ✅ | ✅ | Primary |
| Firefox | 88+ | ✅ | ✅ | ✅ | Supported |
| Safari | 14+ | ✅ | ✅ | ✅ | Supported |
| Edge | 90+ | ✅ | ✅ | ✅ | Supported |
| Opera | 76+ | ✅ | ✅ | ✅ | Supported |
| IE 11 | Any | ❌ | ❌ | ⚠️ | Not Supported |

### 3.2 Mobile Browsers

| Browser | Platform | Touch | Performance | Status |
|---------|----------|-------|-------------|--------|
| Chrome Mobile | Android | ✅ | Good | Primary |
| Safari | iOS 14+ | ✅ | Good | Primary |
| Samsung Internet | Android | ✅ | Good | Supported |
| Firefox Mobile | Android | ✅ | Fair | Supported |
| Chrome | iOS | ✅ | Good | Supported |

### 3.3 Feature Support Requirements

| Feature | Requirement | Fallback |
|---------|-------------|----------|
| WebGL | Required | None (app won't work) |
| Canvas 2D | Required for rain | Hide rain effect |
| requestAnimationFrame | Required | None |
| Touch Events | For mobile | Mouse events only |
| CSS Transitions | For UI | Instant changes |

---

## 4. Mobile Device Testing

### 4.1 Test Devices

| Device | OS | Screen Size | Priority |
|--------|-----|-------------|----------|
| iPhone 14 Pro | iOS 16+ | 6.1" | P0 |
| iPhone SE | iOS 15+ | 4.7" | P1 |
| Samsung Galaxy S23 | Android 13 | 6.1" | P0 |
| Google Pixel 7 | Android 13 | 6.3" | P1 |
| iPad Pro 12.9" | iPadOS 16 | 12.9" | P1 |
| Samsung Tab S8 | Android 12 | 11" | P2 |

### 4.2 Mobile-Specific Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TC-MOB-001 | Touch Navigation | Single finger drag | Smooth camera rotation |
| TC-MOB-002 | Button Tap | Tap control buttons | Responsive, no double-tap zoom |
| TC-MOB-003 | Toggle Tap | Tap effect toggles | Toggle state changes |
| TC-MOB-004 | Orientation Change | Rotate device | Layout adjusts, canvas resizes |
| TC-MOB-005 | Memory Usage | Use for 5+ minutes | No memory leaks, stable FPS |
| TC-MOB-006 | Battery Impact | Use for 10 minutes | Reasonable battery consumption |

---

## 5. Performance Benchmarks

### 5.1 Target Metrics

| Metric | Target | Minimum | Measurement |
|--------|--------|---------|-------------|
| FPS (Desktop) | 60 fps | 30 fps | requestAnimationFrame timing |
| FPS (Mobile) | 60 fps | 24 fps | requestAnimationFrame timing |
| Initial Load | < 3s | < 5s | First paint to interactive |
| Transition Time | 1500ms | 2000ms | CONFIG setting |
| Memory (Desktop) | < 200MB | < 400MB | DevTools Memory |
| Memory (Mobile) | < 150MB | < 250MB | Safari/Chrome DevTools |

### 5.2 Performance Test Cases

| ID | Test Case | Method | Threshold |
|----|-----------|--------|-----------|
| TC-PERF-001 | Render Loop FPS | Chrome DevTools Performance | ≥30 fps sustained |
| TC-PERF-002 | Texture Load Time | Network timing | < 2s per panorama |
| TC-PERF-003 | Transition Smoothness | Visual inspection | No frame drops |
| TC-PERF-004 | Rain Effect FPS Impact | Toggle rain, measure FPS | < 5 fps drop |
| TC-PERF-005 | Memory Leak Check | Navigate 50 times | Memory stable |
| TC-PERF-006 | GPU Memory | WebGL memory | < 512MB |

---

## 6. VR Headset Testing Plan

### 6.1 Target Devices (Future)

| Device | Runtime | Priority | Status |
|--------|---------|----------|--------|
| Meta Quest 2/3 | WebXR | P0 | Planned |
| Meta Quest Pro | WebXR | P1 | Planned |
| Pico 4 | WebXR | P2 | Planned |
| Apple Vision Pro | WebXR/Safari | P1 | Planned |
| HTC Vive | SteamVR WebXR | P2 | Planned |

### 6.2 VR Test Cases (Future Implementation)

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| TC-VR-001 | WebXR Detection | VR button appears when WebXR supported |
| TC-VR-002 | Enter VR Mode | Immersive session starts |
| TC-VR-003 | Head Tracking | Camera follows head rotation |
| TC-VR-004 | Stereoscopic Render | Left/right eye views correct |
| TC-VR-005 | Controller Navigation | Trigger or thumbstick navigates |
| TC-VR-006 | Exit VR | Clean exit back to 2D mode |
| TC-VR-007 | VR Performance | 72/90 fps in VR mode |

---

## 7. Accessibility Testing

| ID | Test Case | WCAG | Expected Result |
|----|-----------|------|-----------------|
| TC-A11Y-001 | Keyboard Navigation | 2.1.1 | All controls keyboard accessible |
| TC-A11Y-002 | Focus Indicators | 2.4.7 | Visible focus states on buttons |
| TC-A11Y-003 | Color Contrast | 1.4.3 | UI text meets 4.5:1 ratio |
| TC-A11Y-004 | Screen Reader | 1.3.1 | Location info announced |
| TC-A11Y-005 | Motion Sensitivity | 2.3.1 | Auto-play can be paused |
| TC-A11Y-006 | Text Sizing | 1.4.4 | UI works at 200% zoom |

---

## 8. Test Execution Schedule

| Phase | Duration | Focus |
|-------|----------|-------|
| Smoke Test | 1 hour | Core functionality (P0) |
| Functional Test | 4 hours | All test cases |
| Browser Compat | 2 hours | Cross-browser testing |
| Mobile Test | 2 hours | Device testing |
| Performance Test | 2 hours | Benchmarks and stress testing |
| Regression Test | 1 hour | Re-test after fixes |

---

## 9. Exit Criteria

### 9.1 Go/No-Go Criteria

- ✅ All P0 tests pass
- ✅ No P0/P1 bugs open
- ✅ Performance meets minimum thresholds
- ✅ Works in Chrome, Firefox, Safari (latest)
- ✅ Mobile touch controls functional

### 9.2 Sign-off Requirements

- QA Engineer sign-off
- Dev Team review of known issues
- Performance benchmark approval

---

*Document maintained by QA Team. Last updated: 2026-02-17*
