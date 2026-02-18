# 🌴 Big Island VR - Explore Hawaiʻi

> **E komo mai** — Welcome to an immersive 360° virtual reality experience of the Big Island of Hawaii!

[![Version](https://img.shields.io/badge/version-3.1.0-blue.svg)](https://github.com/claytondb/dc-bigislandvr-3)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Made with Aloha](https://img.shields.io/badge/Made%20with-Aloha%20🌺-ff69b4.svg)](#)

Experience the Big Island through authentic Google Street View panoramas with immersive ambient audio, dynamic weather effects, and beautiful time-of-day atmospherics.

---

## ✨ Features

### 🗺️ 32 Authentic Locations

Explore the entire Big Island through real Street View panoramas:

| Region | Locations |
|--------|-----------|
| **Hilo** | Bayfront, Banyan Drive, Rainbow Falls, Farmers Market, Pepeʻekeo Scenic Drive |
| **Hamakua Coast** | Akaka Falls, Waipiʻo Valley Lookout, Honokaʻa Town, Laupāhoehoe Point |
| **Volcano** | Village, National Park Entrance, Kīlauea Crater Rim, Chain of Craters, Thurston Lava Tube |
| **Kaʻū District** | Punalu'u Black Sand Beach, South Point (Ka Lae), Nāʻālehu Town |
| **Kona Coast** | Aliʻi Drive, Kailua Pier, Keauhou Bay, Kealakekua Bay, Place of Refuge, Hapuna Beach |
| **Kohala** | Mauna Lani Resort, Waikoloa Village, Hāwī Town, Pololū Valley, Kapaʻau Town |
| **Waimea & Saddle** | Waimea Town, Mauna Kea Access Road, Saddle Road Viewpoint |
| **Puna** | Pāhoa Village |

### 🎯 Guided Tours

Six curated tour routes with auto-play:

- 🌋 **Volcano Day Trip** — Explore Hawaiʻi Volcanoes National Park (6 stops)
- 🏖️ **Kona Coast Explorer** — Historic Kona and beautiful beaches (6 stops)
- 🌿 **Hamakua Heritage** — Waterfalls and valleys (4 stops)
- 🤠 **North Kohala Adventure** — Cowboy country and hidden valleys (3 stops)
- 🐢 **Southern Route** — Kaʻū beaches and South Point (3 stops)
- ❤️ **My Favorites** — Your personally saved locations

### 🎧 Immersive Audio

Location-aware ambient soundscapes that crossfade smoothly:
- 🌊 Ocean waves (louder at beaches)
- 🐦 Tropical birds (quieter in rain)
- 💨 Wind (stronger at high elevation)
- 🌧️ Rain (adjustable intensity)
- 🌋 Volcanic ambience (at Kīlauea)
- 💧 Waterfall sounds (at Rainbow Falls & Akaka Falls)

### 🌦️ Dynamic Weather & Atmosphere

- **Rain Effect** — Canvas-rendered raindrops with wind influence
- **Mist/Fog** — Animated atmospheric overlay for misty locations
- **Time of Day** — Dawn, Day, Golden Hour, Dusk, and Night filters
- **Volcanic Haze** — Special atmosphere for volcano areas

### ✨ Visual Effects Suite (NEW in 3.1)

**Cinematic Effects:**
- 🔆 **Vignette** — Immersive edge darkening for focus
- ☀️ **Lens Flare** — Dynamic sun flare that follows camera
- 💫 **Bloom** — Subtle glow effect for daylight scenes

**Color Grading Presets:**
- **Vivid** — Enhanced saturation for tropical vibrancy
- **Cinematic** — Film-style contrast and color
- **Vintage** — Warm sepia-toned aesthetic
- **Tropical** — Optimized for island colors

**Particle Systems:**
- 🦋 **Butterflies** — Animated butterflies for garden areas
- ✨ **Fireflies** — Glowing particles for dusk/night scenes
- 🍂 **Falling Leaves** — Drifting leaves for forested areas
- 🌋 **Volcanic Ash** — Realistic ash particles near Kīlauea
- 🌊 **Ocean Spray** — Mist particles for coastal cliffs

### 🎬 Cinematic Transitions

- **Fade** — Smooth fade for nearby locations
- **Blur** — Motion blur effect for medium distances
- **Flyover** — Aerial transition for distant locations

### 📸 Enhanced Screenshot Mode

- **Watermark** — Optional "Big Island VR" branding
- **Location Stamp** — Automatic location & date overlay
- **Color Filters** — Apply grading before capture
- **Flash Effect** — Visual feedback on capture

### ❤️ Favorites System

- Click the heart icon to save favorite locations
- Favorites appear in the dropdown menu
- "My Favorites" tour option
- Persisted to localStorage

### 📷 Photo Mode

- Hide all UI for clean screenshots
- One-click screenshot download
- Share button copies direct link to location
- Press `P` to toggle

### ⚙️ Settings Panel

- **Quality Presets** — Low, Medium, High, Ultra
- **Audio Controls** — Master volume, auto-play toggle
- **Visual Effects** — Weather, atmosphere, transitions
- **Tour Duration** — Adjustable auto-play interval
- **Favorites Management** — View and remove favorites
- **Data Management** — Clear all saved preferences

### 🎉 Welcome Experience

- First-time visitor welcome modal
- Feature highlights
- Quick-start options (Explore or Take Tour)
- "Don't show again" option

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` `→` | Previous / Next location |
| `Space` | Toggle auto-play |
| `P` | Toggle photo mode |
| `F` | Toggle fullscreen |
| `M` | Mute / Unmute audio |
| `Esc` | Exit photo mode / Close panels |

---

## 🚀 Getting Started

### Option 1: Direct Use
Simply open `index.html` in a modern browser. No build step required!

### Option 2: Local Server
For the best experience (especially for audio):
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .
```
Then open `http://localhost:8000`

### Option 3: Deploy
Upload `index.html` to any static hosting:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Any web server

---

## 📱 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Recommended |
| Firefox | ✅ Full support |
| Safari | ✅ Full support |
| Edge | ✅ Full support |
| Mobile browsers | ✅ Responsive design |

---

## 🎨 Design System

Hawaiian-inspired color palette:

| Token | Hex | Usage |
|-------|-----|-------|
| Kona Blue | `#0D3B66` | Deep backgrounds |
| Pacific Teal | `#1A6B7C` | Ocean tones |
| Shallow Water | `#3DA5D9` | Focus states |
| Seafoam | `#7FCDCD` | Accents, labels |
| Ti Leaf | `#2A9D8F` | Primary actions |
| Pikake | `#F4A261` | Tours, highlights |
| Hibiscus | `#E63946` | Alerts, favorites |
| Orchid | `#9B5DE5` | Special buttons |
| Lava Black | `#1A1A1A` | Backgrounds |
| Plumeria | `#FAF8F5` | Text |

Typography:
- **Display**: DM Sans
- **Primary**: Inter
- **Accent**: Lora (italic)

---

## 📸 Screenshots

*Coming soon! Take your own with Photo Mode (P key)*

---

## 🔧 Technical Details

- **Single-file architecture** — Everything in one HTML file (~100KB)
- **Zero dependencies** — Just Google Maps/Street View APIs
- **Web Audio API** — Spatial audio mixing and crossfades
- **Canvas API** — Efficient rain animation
- **CSS Custom Properties** — Themeable design tokens
- **localStorage** — Persistent preferences and favorites
- **URL sharing** — `?loc=ID` parameter for direct location links

### API Usage
This project uses the Google Maps JavaScript API and Street View API. The included API key is for demo purposes.

---

## 🔒 Privacy

- No tracking or analytics
- All preferences stored locally in your browser
- No data sent to external servers (except Google Maps API)

---

## 📝 Changelog

### Version 3.1.0 (Current)
- ✨ **Visual Effects Suite** — Vignette, lens flare, and bloom effects
- 🎨 **Color Grading** — Four cinematic presets (Vivid, Cinematic, Vintage, Tropical)
- 🦋 **Particle Systems** — Butterflies, fireflies, leaves, volcanic ash, ocean spray
- 🌇 **Golden Hour** — New time-of-day option with warm lighting
- 🎬 **Cinematic Transitions** — Blur and flyover effects based on distance
- 📸 **Screenshot Enhancements** — Watermarks, location stamps, flash effect
- 🌴 **Enhanced Loading Screen** — Island silhouette, rotating tips, smooth animations
- ☀️ **Dynamic Lens Flare** — Sun position follows camera heading
- 🌙 **Night Atmosphere** — Moon and enhanced night lighting
- 📱 **Improved Mobile Support** — Better responsive effects panel

### Version 3.0.0
- ✨ Expanded to 32 locations across all regions
- 🎯 6 guided tour routes
- ❤️ Favorites system with localStorage persistence
- 📷 Photo mode with screenshot & share
- ⚙️ Comprehensive settings panel
- 🎉 Welcome/onboarding modal
- 🎨 Quality presets (Low/Medium/High/Ultra)
- 🔊 Improved audio with crossfading
- 🌦️ Dynamic weather effects
- ☀️ Time of day atmospherics
- 🗺️ Interactive mini-map
- 📱 Improved mobile responsiveness

---

## 📄 License

MIT License — Feel free to use, modify, and share!

---

## 🎵 Audio Credits

All ambient sounds are CC0/Public Domain from [Freesound.org](https://freesound.org):
- Ocean waves
- Tropical birds
- Wind ambience
- Rain sounds
- Waterfall
- Volcanic rumble

---

## 🤝 Contributing

Contributions welcome! Ideas for improvement:
- Additional locations
- New tour routes
- Accessibility improvements
- Performance optimizations
- Localization

---

## 🌺 Mahalo!

Made with aloha for Hawaii lovers everywhere.

*"The Big Island is not just a destination—it's a state of mind."*

---

<p align="center">
  <img src="https://img.shields.io/badge/Built%20with-🌴%20Aloha-success" alt="Built with Aloha">
</p>
