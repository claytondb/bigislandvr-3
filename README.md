# 🌴 Big Island VR - Explore Hawaiʻi

> **E komo mai** — Welcome to an immersive 360° virtual reality experience of the Big Island of Hawaii!

[![Version](https://img.shields.io/badge/version-3.1.0-blue.svg)](https://github.com/claytondb/dc-bigislandvr-3)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Made with Aloha](https://img.shields.io/badge/Made%20with-Aloha%20🌺-ff69b4.svg)](#)

Experience the Big Island through authentic Google Street View panoramas with immersive ambient audio, dynamic weather effects, educational Hawaiian language content, and beautiful time-of-day atmospherics.

---

## ✨ Features

### 🗺️ 33 Authentic Locations

Explore the entire Big Island through real Street View panoramas across 9 regions:

| Region | Locations |
|--------|-----------|
| **Hilo** (5) | Bayfront, Banyan Drive, Rainbow Falls, Farmers Market, Pepeʻekeo Scenic Drive |
| **Hamakua** (4) | Akaka Falls, Waipiʻo Valley Lookout, Honokaʻa Town, Laupāhoehoe Point |
| **Puna** (2) | Keaʻau Town Center, Pāhoa Village |
| **Volcano** (5) | Village, Kīlauea Visitor Center, Crater Rim, Chain of Craters, Thurston Lava Tube |
| **Kaʻū** (3) | Punalu'u Black Sand Beach, South Point (Ka Lae), Nāʻālehu Town |
| **Kona** (6) | Aliʻi Drive, Kailua Pier, Keauhou Bay, Kealakekua Bay, Place of Refuge, Hapuna Beach |
| **Kohala** (5) | Mauna Lani Resort, Waikoloa Village, Hāwī Town, Pololū Valley, Kapaʻau Town |
| **Waimea** (1) | Town Center (Paniolo Country) |
| **Saddle** (2) | Mauna Kea Access Road, Saddle Road Viewpoint |

### 🎯 Auto-Tour Mode

- **Space bar** to start/stop automatic tour
- 12-second intervals between locations
- Visit all 33 locations sequentially
- Pauses when browser tab is hidden

### 🏆 Achievements & Gamification

- **Location Tracker** — Progress bar for visited locations (33 total)
- **Region Explorer** — Track exploration across 9 regions
- **Treasure Hunt** — Discover 8 hidden treasures at special locations
- **Persistence** — Progress saved to localStorage

#### 🌺 Flora & Fauna Guide
- **8 native plants**: ʻŌhiʻa Lehua, Koa, Hapuʻu Fern, Ti Plant, Silversword, and more
- **8 notable animals**: Honu (sea turtles), Humpback whales, Spinner dolphins, Manta rays, Nēnē, and more
- Where to see each species
- Best times for wildlife viewing
- Conservation information

#### 🙏 Cultural Tips
- **10 essential etiquette guidelines**
- How to respect sacred sites
- The legend of Pele's curse (lava rocks)
- Proper behavior around sea turtles
- Supporting local communities
- The meaning of aloha spirit

### 🎭 Seasonal & Event Themes

#### 🎉 Merrie Monarch Festival (April)
- Information about the world's premier hula competition
- Tips for attending
- Hilo-specific celebrations

#### 🐋 Whale Watching Season (November-May)
- Best viewing locations
- Peak times and behaviors
- Fun facts about humpback whales

#### 🌋 Volcanic Activity Status
- Current conditions info
- Safety guidelines
- Viewing tips during eruptions

#### 🌸 Seasonal Flower Blooms
- What's blooming each season
- Jacaranda season in Hilo
- Peak plumeria viewing times
- Orchid farm visits

### 🔍 Location Deep-Dives

Each location now features:
- **Extended descriptions** with historical and cultural context
- **Visitor tips**: parking, hours, fees, best times
- **Accessibility information**
- **Official website links**
- **Related Hawaiian vocabulary**
- **Nearby locations** for easy navigation

### 🎧 Immersive Audio

Location-aware ambient soundscapes that crossfade smoothly:
- 🌊 Ocean waves (louder at beaches)
- 🐦 Tropical birds (varies by ecosystem)
- 💨 Wind (stronger at high elevation)
- 🌧️ Rain (adjustable intensity)
- 🌋 Volcanic ambience (at Kīlauea)
- 💧 Waterfall sounds (at Rainbow Falls, Akaka Falls, etc.)
- ☕ Coffee farm ambience (in Kona coffee country)

### 🌦️ Dynamic Weather & Atmosphere

- **Rain Effect** — Canvas-rendered raindrops with wind influence
- **Mist/Fog** — Animated atmospheric overlay for misty locations
- **Time of Day** — Dawn, Day, Dusk, and Night filters
- **Volcanic Haze** — Special atmosphere for volcano areas

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

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` `→` | Previous / Next location |
| `Space` | Toggle auto-play |
| `P` | Toggle photo mode |
| `F` | Toggle fullscreen |
| `M` | Mute / Unmute audio |
| `L` | Open location list |
| `V` | Enter VR mode |
| `Esc` | Exit photo mode / Close panels |

---

## 🗣️ Hawaiian Language Quick Reference

| Word | Meaning | Pronunciation |
|------|---------|---------------|
| Aloha | Hello, goodbye, love | ah-LOH-hah |
| Mahalo | Thank you | mah-HAH-loh |
| ʻĀina | Land | EYE-nah |
| Mauka | Toward the mountain | MOW-kah |
| Makai | Toward the ocean | mah-KAI |
| Pele | Goddess of volcanoes | PEH-leh |
| ʻOhana | Family | oh-HAH-nah |
| Honu | Sea turtle | HOH-noo |
| Heiau | Temple | HEY-ee-ow |
| Mana | Spiritual power | MAH-nah |

*See the full glossary of 20 Hawaiian words in the app!*

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

## 🔧 Technical Details

- **Data-driven architecture** — Location data in JSON, UI renders dynamically
- **Zero dependencies** — Just Google Maps/Street View APIs
- **Web Audio API** — Spatial audio mixing and crossfades
- **Canvas API** — Efficient rain animation
- **CSS Custom Properties** — Themeable design tokens
- **localStorage** — Persistent preferences and favorites
- **URL sharing** — `?loc=ID` parameter for direct location links
- **WebXR** — VR headset support where available

### API Usage
This project uses the Google Maps JavaScript API and Street View API. The included API key is for demo purposes.

### Data Structure
Location data is stored in `panoramas/locations.json` with the following structure:
- 60 locations with full metadata
- 14 curated tour routes
- Educational content (Hawaiian words, cultural tips, flora/fauna)
- Seasonal theme information
- Audio and atmosphere settings per location

---

## 🔒 Privacy

- No tracking or analytics
- All preferences stored locally in your browser
- No data sent to external servers (except Google Maps API)

---

## 📝 Changelog

### Version 3.1.0 (Current)
- ✨ **Expanded to 60 locations** across all regions
- 🎯 **14 guided tour routes** including new Coffee Country, Waterfalls, and Historical tours
- 📚 **Educational content system**:
  - 20 Hawaiian vocabulary words with pronunciations
  - 10 cultural etiquette tips
  - Flora guide (8 native plants)
  - Fauna guide (8 animals with best viewing info)
- 🎭 **Seasonal themes**:
  - Merrie Monarch Festival info
  - Whale watching season guide
  - Volcanic activity status
  - Seasonal flower bloom guide
- 📍 **Enhanced location details**:
  - Extended descriptions with cultural context
  - Visitor tips (parking, hours, fees)
  - Accessibility information
  - Official website links
- 🗺️ **New regions**: Mauna Kea, Coffee Country
- ☕ **Coffee Country tour** with major Kona farms
- 💧 **Waterfalls tour** featuring 5 spectacular falls
- 🏛️ **Historical Hawaii tour** with ancient temple sites

### Version 3.0.0
- Initial 32 locations across all regions
- 6 guided tour routes
- Favorites system with localStorage persistence
- Photo mode with screenshot & share
- Comprehensive settings panel
- Welcome/onboarding modal
- Quality presets (Low/Medium/High/Ultra)
- Improved audio with crossfading
- Dynamic weather effects
- Time of day atmospherics
- Interactive mini-map
- Improved mobile responsiveness

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
- Coffee farm ambience

---

## 🤝 Contributing

Contributions welcome! Ideas for improvement:
- Additional locations with Street View coverage
- New tour routes
- More Hawaiian vocabulary
- Accessibility improvements
- Performance optimizations
- Localization (Japanese, Korean, Chinese)

---

## 🌺 Mahalo!

Made with aloha for Hawaii lovers everywhere.

*"The Big Island is not just a destination—it's a state of mind."*

---

<p align="center">
  <img src="https://img.shields.io/badge/Built%20with-🌴%20Aloha-success" alt="Built with Aloha">
</p>
