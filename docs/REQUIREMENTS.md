# Big Island VR 3.0 — Requirements Document

**Version:** 1.0  
**Date:** 2026-02-17  
**Status:** Draft  

---

## Table of Contents

1. [Project Vision](#1-project-vision)
2. [User Stories](#2-user-stories)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Content Requirements](#5-content-requirements)
6. [Technical Constraints](#6-technical-constraints)
7. [Dependencies & Integrations](#7-dependencies--integrations)
8. [Acceptance Criteria](#8-acceptance-criteria)
9. [Out of Scope](#9-out-of-scope)
10. [Glossary](#10-glossary)

---

## 1. Project Vision

### 1.1 Mission Statement

Create an immersive virtual reality experience of Hawaii's Big Island that surpasses existing solutions like Wander VR in visual fidelity, atmospheric realism, and emotional resonance.

### 1.2 Goals

| Priority | Goal | Success Metric |
|----------|------|----------------|
| P0 | Photorealistic panoramic views | User rating ≥4.5/5 for visual quality |
| P0 | Smooth, natural movement between locations | No jarring cuts; morphed transitions |
| P1 | Authentic sense of "being there" | Ambient audio + weather effects |
| P1 | Accessibility from any device | Web-first, then native VR |
| P2 | Evoke nostalgia for Hawaii residents/expats | Emotional testimonials |

### 1.3 Target Platforms

| Phase | Platform | Technology | Timeline |
|-------|----------|------------|----------|
| 1 | Web Browser | Three.js + WebGL | MVP |
| 2 | Mobile Web | Three.js (responsive) | MVP |
| 3 | Meta Quest 2/3/Pro | WebXR | v1.1 |
| 4 | Native Quest App | React Native / Unity | v2.0 (stretch) |

### 1.4 Differentiators vs. Wander VR

| Feature | Wander VR | Big Island VR 3.0 |
|---------|-----------|-------------------|
| Image Quality | Street View native | AI-upscaled 4K+ |
| Transitions | Hard cut | AI-morphed smooth blend |
| Audio | None/minimal | Spatial audio per location |
| Weather | Static | Dynamic rain, wind, time-of-day |
| Depth | 2D panorama | Depth-map enabled parallax |
| Focus | Global coverage | Deep Big Island curation |

---

## 2. User Stories

### 2.1 Primary Personas

#### Persona A: The Armchair Explorer
> "I want to explore places I've never been without leaving my living room."

#### Persona B: The Hawaii Expat
> "I moved to the mainland 10 years ago. I want to revisit the places I grew up and miss every day."

#### Persona C: The Trip Planner
> "I'm planning a Hawaii vacation and want to preview destinations before I book."

#### Persona D: The VR Enthusiast
> "I want the most immersive, high-quality VR experience possible."

### 2.2 User Story Map

#### Epic 1: Exploration
| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| US-001 | As an explorer, I want to view 360° panoramas so I can look around naturally | P0 | Full sphere view, mouse/touch/VR controller rotation |
| US-002 | As an explorer, I want to move between locations so I can take virtual journeys | P0 | Click/select waypoint to transition |
| US-003 | As an explorer, I want smooth transitions so movement feels natural | P0 | No hard cuts; morphed blend ≤2 seconds |
| US-004 | As an explorer, I want to choose different routes so I can customize my journey | P1 | Route selector with named paths |

#### Epic 2: Immersion
| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| US-005 | As a user, I want to hear ambient sounds so locations feel alive | P0 | Location-specific audio loops |
| US-006 | As a user, I want spatial audio so sounds come from realistic directions | P1 | Web Audio API spatial positioning |
| US-007 | As a user, I want weather effects so environments feel dynamic | P1 | Rain particles, wind audio, cloud shadows |
| US-008 | As a user, I want time-of-day options so I can experience dawn/dusk | P2 | Lighting presets or slider |

#### Epic 3: VR Mode
| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| US-009 | As a VR user, I want to use my headset so I get full immersion | P0 | WebXR "Enter VR" button |
| US-010 | As a VR user, I want controller support so I can navigate naturally | P1 | Point-and-click locomotion |
| US-011 | As a Quest user, I want hand tracking so I don't need controllers | P2 | WebXR hand tracking API |

#### Epic 4: Accessibility & Convenience
| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| US-012 | As a mobile user, I want responsive design so I can use my phone | P0 | Touch controls, portrait/landscape |
| US-013 | As a returning user, I want offline access so I can view saved locations | P1 | PWA with cached panoramas |
| US-014 | As a user, I want to bookmark favorites so I can return quickly | P2 | Local storage favorites list |
| US-015 | As a user, I want to share locations so friends can see what I found | P2 | Shareable URL per waypoint |

---

## 3. Functional Requirements

### 3.1 Panorama Viewing System

| ID | Requirement | Details |
|----|-------------|---------|
| FR-001 | Equirectangular projection | Render 2:1 aspect ratio panoramas on inverse sphere |
| FR-002 | Full 360° horizontal rotation | User can look in any direction |
| FR-003 | ±90° vertical rotation | Look up to sky, down to ground |
| FR-004 | Zoom capability | 0.5x to 2x optical zoom, FOV adjustment |
| FR-005 | Depth-based parallax | Slight parallax shift based on depth map when moving head |

### 3.2 Navigation System

| ID | Requirement | Details |
|----|-------------|---------|
| FR-006 | Waypoint markers | Visual indicators for navigable destinations |
| FR-007 | Waypoint hover preview | Thumbnail/name on hover |
| FR-008 | Click-to-move | Single click/tap/trigger to initiate transition |
| FR-009 | Morphed transitions | AI-generated intermediate frames for smooth movement |
| FR-010 | Transition duration | 1.5–2.5 seconds, user-configurable |
| FR-011 | Route selection | Pre-defined paths (e.g., "Hilo to Volcano", "Saddle Road") |
| FR-012 | Free roam mode | Optional: jump to any location on map |

### 3.3 Audio System

| ID | Requirement | Details |
|----|-------------|---------|
| FR-013 | Ambient audio loops | Location-specific (ocean, rainforest, town, etc.) |
| FR-014 | Spatial audio positioning | Sounds anchored to directions (e.g., ocean to the east) |
| FR-015 | Crossfade between locations | Smooth audio transition during movement |
| FR-016 | Volume controls | Master, ambient, effects sliders |
| FR-017 | Mute toggle | Quick mute button |

### 3.4 Weather & Environment Effects

| ID | Requirement | Details |
|----|-------------|---------|
| FR-018 | Rain particle system | Configurable intensity, visible droplets |
| FR-019 | Rain audio | Synced to particle intensity |
| FR-020 | Wind effects | Audio + subtle panorama shake/sway |
| FR-021 | Bird/wildlife sounds | Random triggering, spatially positioned |
| FR-022 | Time-of-day presets | Dawn, day, golden hour, dusk, night |
| FR-023 | Cloud shadow overlay | Moving shadows for realism |

### 3.5 VR Mode (WebXR)

| ID | Requirement | Details |
|----|-------------|---------|
| FR-024 | WebXR session initiation | "Enter VR" button, session management |
| FR-025 | Stereo rendering | Left/right eye views |
| FR-026 | Head tracking | 6DoF orientation from headset |
| FR-027 | Controller input | Ray-cast pointing for waypoint selection |
| FR-028 | Comfort options | Vignette during movement, teleport-only locomotion |
| FR-029 | Exit VR | Clean session teardown, return to 2D |

### 3.6 UI/UX Components

| ID | Requirement | Details |
|----|-------------|---------|
| FR-030 | Loading screen | Progress indicator, location preview |
| FR-031 | HUD overlay | Current location name, controls, settings |
| FR-032 | Settings panel | Audio, graphics quality, accessibility |
| FR-033 | Map view | Overview of all locations, current position |
| FR-034 | Keyboard shortcuts | Arrow keys (rotate), space (next waypoint), M (map) |
| FR-035 | Touch gestures | Swipe (rotate), pinch (zoom), tap (select) |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-001 | Panorama load time | < 3 seconds | Time from click to full render |
| NFR-002 | Frame rate | ≥ 60 fps | Consistent on target hardware |
| NFR-003 | VR frame rate | ≥ 72 fps | Quest native refresh rate |
| NFR-004 | Memory usage | < 500 MB | Browser tab memory |
| NFR-005 | Initial page load | < 5 seconds | First contentful paint |
| NFR-006 | Transition smoothness | No visible stuttering | User perception |

### 4.2 Scalability

| ID | Requirement | Details |
|----|-------------|---------|
| NFR-007 | Support 100+ panoramas | No performance degradation |
| NFR-008 | Lazy loading | Load panoramas on-demand |
| NFR-009 | LOD (Level of Detail) | Lower res preview, progressive enhancement |

### 4.3 Compatibility

| ID | Requirement | Details |
|----|-------------|---------|
| NFR-010 | Browsers | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| NFR-011 | Mobile browsers | Chrome Mobile, Safari iOS |
| NFR-012 | VR Headsets | Meta Quest 2, Quest 3, Quest Pro |
| NFR-013 | Fallback mode | Graceful degradation for older devices |

### 4.4 Accessibility

| ID | Requirement | Details |
|----|-------------|---------|
| NFR-014 | Keyboard navigation | Full app control without mouse |
| NFR-015 | Screen reader support | ARIA labels on interactive elements |
| NFR-016 | Color contrast | WCAG AA compliance for UI |
| NFR-017 | Motion sensitivity | Reduced motion option |
| NFR-018 | Subtitles/captions | For any narration or audio descriptions |

### 4.5 Offline & PWA

| ID | Requirement | Details |
|----|-------------|---------|
| NFR-019 | Service worker | Cache app shell and assets |
| NFR-020 | Offline viewing | View previously loaded panoramas |
| NFR-021 | Install prompt | "Add to Home Screen" capability |
| NFR-022 | Background sync | Download queued panoramas when online |

### 4.6 Security & Privacy

| ID | Requirement | Details |
|----|-------------|---------|
| NFR-023 | HTTPS only | All resources served securely |
| NFR-024 | No tracking | Minimal analytics, no PII collection |
| NFR-025 | Content licensing | Clear rights for all imagery/audio |

---

## 5. Content Requirements

### 5.1 Priority Locations

| Region | Priority | Key Locations | Target Panoramas |
|--------|----------|---------------|------------------|
| **Hilo** | P0 | Downtown, Bayfront, Banyan Drive, Rainbow Falls | 15-20 |
| **Keaau** | P0 | Town center, Shipman Park, Route 130 | 10-15 |
| **Volcano** | P0 | Kilauea Overlook, Crater Rim, Thurston Lava Tube, Chain of Craters | 20-25 |
| **Saddle Road** | P1 | Full route: Hilo to Kona, Mauna Kea Access Rd turnoff | 15-20 |
| **Kona** | P1 | Ali'i Drive, Kailua Pier, Magic Sands Beach | 15-20 |
| **Waipio Valley** | P2 | Lookout, Valley floor (if accessible) | 5-10 |
| **Mauna Kea** | P2 | Visitor center, Summit area | 5-10 |
| **South Point** | P2 | Ka Lae, Green Sand Beach | 5-10 |

**Total Target: 100-130 panoramas for MVP**

### 5.2 Route Definitions

| Route ID | Name | Description | Est. Waypoints |
|----------|------|-------------|----------------|
| R-001 | Hilo Downtown | Walking tour of historic Hilo | 10-12 |
| R-002 | Hilo to Volcano | Drive up Highway 11 | 12-15 |
| R-003 | Crater Rim Drive | Full loop of Kilauea | 15-18 |
| R-004 | Chain of Craters | Descent to coast | 10-12 |
| R-005 | Saddle Road | Cross-island journey | 15-20 |
| R-006 | Kona Coast | Ali'i Drive cruise | 10-12 |
| R-007 | Puna District | Keaau to Kalapana | 10-12 |

### 5.3 Image Quality Standards

| Attribute | Minimum | Target | Notes |
|-----------|---------|--------|-------|
| Resolution | 4096 × 2048 | 8192 × 4096 | Per panorama face |
| Format | JPEG (85%) | WebP + JPEG fallback | Progressive loading |
| Color depth | 8-bit | 8-bit (HDR optional) | sRGB color space |
| Stitching | No visible seams | Seamless | Human QA required |
| Upscaling | Real-ESRGAN 2x | Real-ESRGAN 4x | From Street View source |

### 5.4 Depth Map Standards

| Attribute | Requirement |
|-----------|-------------|
| Model | Depth Anything v2 |
| Resolution | Match panorama resolution |
| Format | 16-bit PNG or EXR |
| Coverage | All panoramas |
| QA | Manual review for artifacts |

### 5.5 Audio Content

| Category | Examples | Format | Per Location |
|----------|----------|--------|--------------|
| Ambient loops | Ocean waves, rain, wind, traffic | MP3/OGG, 128kbps | 1-3 layers |
| Wildlife | Birds (various species), insects | MP3/OGG, 128kbps | 0-2 per location |
| Environmental | Waterfall, lava vent (Volcano) | MP3/OGG, 128kbps | As appropriate |

**Audio Sources:**
- Freesound.org (CC0/CC-BY)
- Field recordings (original)
- Licensed stock audio

---

## 6. Technical Constraints

### 6.1 Source Imagery

| Constraint | Details |
|------------|---------|
| Primary source | Google Street View Static API |
| API quotas | 25,000 requests/day (free tier) |
| Terms of use | Must comply with Google ToS; no bulk scraping |
| Alternatives | Original photography, drone footage (future) |

### 6.2 AI Processing Pipeline

| Stage | Tool | Input | Output |
|-------|------|-------|--------|
| Fetch | Street View API | Lat/lng coordinates | 640×640 tiles (max) |
| Stitch | Custom script / Hugin | 6 cube faces | Equirectangular panorama |
| Upscale | Real-ESRGAN (4x) | Low-res panorama | 4K/8K panorama |
| Depth | Depth Anything v2 | Panorama image | Depth map (same res) |
| Morph | FILM / Frame interpolation | Two panoramas | Intermediate frames |

### 6.3 Frontend Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Vanilla JS or lightweight (Svelte) | Performance, simplicity |
| 3D Engine | Three.js | Mature, WebXR support |
| Audio | Web Audio API | Spatial audio, cross-platform |
| State | Zustand or vanilla | Minimal overhead |
| Build | Vite | Fast HMR, modern bundling |
| PWA | Workbox | Service worker management |

### 6.4 Hosting & Delivery

| Component | Approach |
|-----------|----------|
| Static hosting | Vercel / Netlify / GitHub Pages |
| CDN | Cloudflare (free tier sufficient) |
| Image delivery | Progressive JPEG, WebP with fallback |
| Asset preloading | Prefetch adjacent waypoints |

### 6.5 VR Hardware Targets

| Device | Min Spec | Notes |
|--------|----------|-------|
| Meta Quest 2 | Snapdragon XR2, 6GB RAM | Primary target |
| Meta Quest 3 | Snapdragon XR2 Gen 2 | Enhanced graphics |
| Quest Pro | Same as Quest 2 | Eye tracking (future) |
| PCVR | Via browser | Lower priority |

---

## 7. Dependencies & Integrations

### 7.1 External APIs

| API | Purpose | Criticality |
|-----|---------|-------------|
| Google Street View | Source imagery | High |
| Mapbox / Leaflet | Map UI overlay | Medium |
| Weather API (optional) | Real-time conditions | Low |

### 7.2 AI Models (Local/Cloud)

| Model | Purpose | Deployment |
|-------|---------|------------|
| Real-ESRGAN | Image upscaling | Local (Python) |
| Depth Anything v2 | Depth estimation | Local (Python) |
| FILM | Frame interpolation | Local (Python) |

### 7.3 Third-Party Libraries

| Library | Purpose |
|---------|---------|
| Three.js | 3D rendering |
| @react-three/xr (optional) | React WebXR bindings |
| Howler.js (optional) | Audio management |
| Workbox | PWA/service worker |

---

## 8. Acceptance Criteria

### 8.1 MVP Definition

The MVP is complete when:

- [ ] ≥50 panoramas across 3+ regions are viewable
- [ ] At least 2 routes are fully navigable
- [ ] Morphed transitions work between all connected waypoints
- [ ] Ambient audio plays at each location
- [ ] Works on Chrome desktop and Chrome mobile
- [ ] WebXR mode launches on Quest browser
- [ ] Loads in <5 seconds on 50 Mbps connection
- [ ] Maintains 60fps on mid-range hardware (GTX 1060 / M1 Mac)

### 8.2 Quality Gates

| Phase | Gate Criteria |
|-------|---------------|
| Alpha | Core viewer works; 10+ panoramas; no VR |
| Beta | 50+ panoramas; VR mode; audio; transitions |
| RC | All routes; PWA; performance targets met |
| Release | QA pass; accessibility audit; user testing |

---

## 9. Out of Scope

The following are explicitly **not** included in v1.0:

| Feature | Reason | Revisit in |
|---------|--------|------------|
| User accounts / auth | Complexity; not needed for experience | v2.0 |
| Multiplayer / shared viewing | Major engineering effort | v2.0+ |
| User-generated content | Moderation challenges | v2.0+ |
| Real-time weather sync | Nice-to-have, not core | v1.5 |
| Narrated tours | Requires voice talent, scripting | v1.5 |
| Physical merchandise | Out of scope for software | Never |
| Other Hawaiian islands | Scope creep; Big Island first | v3.0 |

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **Equirectangular** | 2:1 aspect ratio panoramic projection (360° × 180°) |
| **Waypoint** | A navigable location with a panorama |
| **Morph transition** | AI-generated intermediate frames between two panoramas |
| **WebXR** | W3C standard for VR/AR in web browsers |
| **PWA** | Progressive Web App — installable, offline-capable web app |
| **LOD** | Level of Detail — multiple resolution versions of assets |
| **Depth map** | Grayscale image encoding distance from camera |
| **Real-ESRGAN** | AI model for image super-resolution |
| **Depth Anything v2** | AI model for monocular depth estimation |
| **FILM** | Frame Interpolation for Large Motion — Google's frame interpolation model |
| **Three.js** | JavaScript 3D library built on WebGL |
| **Spatial audio** | Audio positioned in 3D space around the listener |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-17 | Requirements Analyst | Initial draft |

---

*This document is the source of truth for Big Island VR 3.0 requirements. All implementation decisions should reference this document. Updates require review and version increment.*
