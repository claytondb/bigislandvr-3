# 🌴 Big Island VR - Explore Hawaiʻi

An immersive 360° virtual reality experience of the Big Island of Hawaii using real Google Street View panoramas.

**E komo mai** — Welcome!

## ✨ Features

### 🗺️ Real Locations
Explore the Big Island through authentic Street View panoramas:

- **Hilo Area** - Bayfront, Banyan Drive, Coconut Island, Downtown
- **Volcano** - Steam Vents, Jaggar Museum Overlook, Kilauea Caldera
- **Kona Coast** - Coming soon
- **Hamakua Coast** - Coming soon

### 🥽 WebXR VR Mode
- **"Enter VR" button** - Works on Meta Quest browser
- **VR controller support** - Point and trigger to teleport
- **Gaze-based selection** - Fallback for Cardboard-style viewers
- **VR-optimized UI panels** - Floating, readable at distance
- **Clean exit** - Look down to find exit button

### 📱 Mobile Touch Optimization
- **Pinch to zoom** - Adjust field of view with two fingers
- **Swipe gestures** - Swipe left/right to change locations
- **Bottom sheet** - Touch-friendly location selector
- **Large touch targets** - Minimum 44px buttons
- **Keyboard hints hidden** - Clean mobile interface

### ⚡ Performance Optimization
- **Lazy loading** - Street View loads only when needed
- **Memory management** - Efficient transitions between locations
- **Optimized particles** - Reduced effects on mobile
- **Performance mode toggle** - Disable effects for best performance

### 📲 PWA (Progressive Web App)
- **Installable** - Add to Home Screen on mobile/desktop
- **Offline shell** - Basic app shell cached via Service Worker
- **App manifest** - Big Island branding and icons
- **Splash screen** - Beautiful loading experience

### ♿ Accessibility
- **Screen reader support** - ARIA live regions announce location changes
- **High contrast mode** - Toggle for better visibility
- **Reduced motion** - Respects prefers-reduced-motion
- **Keyboard navigation** - Full keyboard control throughout
- **Skip links** - Skip to main content

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` `→` | Previous / Next location |
| `Space` | Toggle auto-play |
| `F` | Toggle fullscreen |
| `L` | Open location list |
| `V` | Enter VR mode |
| `A` | Open accessibility options |
| `Esc` | Exit VR / Close panels |

## 🎛️ Ambient Effects

Each location has unique ambient audio and visual effects:

- 🌧️ Rain overlay
- 💨 Wind sounds
- 🐦 Bird sounds  
- 🌊 Ocean waves
- 🌋 Volcanic atmosphere
- 🌫️ Mist particles

## 🖥️ Usage

### Quick Start
```bash
# Serve the public folder
cd public
python -m http.server 8000
# or
npx serve
```

Then open http://localhost:8000 in your browser.

### VR Mode Requirements
- **Quest Browser**: Built-in WebXR support
- **Chrome on Android**: With WebXR enabled
- **Mobile Cardboard**: Fallback gaze-based controls

## 📁 Project Structure

```
dc-bigislandvr-3/
├── public/
│   ├── index.html        # Main application (single file)
│   ├── manifest.json     # PWA manifest
│   ├── sw.js            # Service worker
│   ├── icons/           # PWA icons
│   └── generate-icons.html # Icon generator tool
├── panoramas/
│   ├── locations.json   # Location database
│   ├── processed/       # Full panorama images
│   ├── tiles/          # Tiled panoramas for LOD
│   └── stitched/       # Raw stitched images
├── audio/
│   └── SOURCES.md      # Audio attribution
├── scripts/            # Processing scripts
└── docs/              # Design documentation
```

## 🔧 Technical Details

- **Single-file architecture** - Everything in one HTML file
- **Google Street View API** - Real panorama imagery
- **WebXR API** - Native VR headset support
- **Web Audio API** - Ambient sound system
- **Service Worker** - Offline caching
- **CSS Variables** - Hawaiian-themed design tokens

## 🎨 Design System

Hawaiian-inspired color palette:

| Token | Color | Use |
|-------|-------|-----|
| Kona Blue | `#0D3B66` | Deep ocean |
| Pacific Teal | `#1A6B7C` | Ocean tones |
| Seafoam | `#7FCDCD` | Accents |
| Ti Leaf | `#2A9D8F` | Primary actions |
| Pikake | `#F4A261` | Highlights |
| Hibiscus | `#E63946` | Alerts |
| Lava Black | `#1A1A1A` | Backgrounds |
| Plumeria | `#FAF8F5` | Text |

## 📱 Browser Support

| Browser | Desktop | Mobile | VR |
|---------|---------|--------|-----|
| Chrome | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ⚠️ |
| Safari | ✅ | ✅ | ❌ |
| Edge | ✅ | ✅ | ✅ |
| Quest Browser | - | - | ✅ |

## 📄 License

MIT License - Feel free to use and modify!

## 🌺 Mahalo!

Made with aloha for Hawaii lovers everywhere.

---

*"The Big Island is not just a destination—it's a state of mind."*
