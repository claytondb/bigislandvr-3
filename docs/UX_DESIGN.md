# Big Island VR 3.0 - UX Design System

> *"E komo mai" - Welcome. Creating a sense of being there for those who miss Hawaii.*

---

## Design Philosophy

### Core Principles

1. **Immersive First** - Remove UI friction. The viewer should feel like a window, not an app.
2. **Mālama (Care)** - Gentle, calming interactions. Nothing jarring or aggressive.
3. **ʻĀina Connection** - Honor the land through authentic colors, textures, and ambient presence.
4. **Accessibility** - Works for everyone, from mobile to VR headsets.

### Emotional Goals

- **Nostalgia** - Trigger genuine memories of Hawaii
- **Peace** - Create a calming escape from stress
- **Presence** - "I am there" not "I am watching"
- **Mana** - Convey the spiritual energy of these places

---

## Color Palette

### Primary Colors (Ocean & Sky)

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Kona Blue** | `#0D3B66` | 13, 59, 102 | Primary backgrounds, headers |
| **Pacific Teal** | `#1A6B7C` | 26, 107, 124 | Interactive elements, hover states |
| **Shallow Water** | `#3DA5D9` | 61, 165, 217 | Highlights, links, focus rings |
| **Seafoam** | `#7FCDCD` | 127, 205, 205 | Success states, active toggles |

### Secondary Colors (Volcanic Earth)

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Lava Black** | `#1A1A1A` | 26, 26, 26 | Primary UI overlays |
| **Pāhoehoe** | `#2D2D2D` | 45, 45, 45 | Secondary backgrounds |
| **Volcanic Ash** | `#4A4A4A` | 74, 74, 74 | Disabled states, borders |
| **Cinder** | `#6B6B6B` | 107, 107, 107 | Muted text |

### Accent Colors (Tropical Flora)

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Plumeria White** | `#FAF8F5` | 250, 248, 245 | Primary text on dark |
| **Hibiscus Red** | `#E63946` | 230, 57, 70 | Warnings, live/recording |
| **Pikake Gold** | `#F4A261` | 244, 162, 97 | Highlights, sunset mode |
| **Ti Leaf Green** | `#2A9D8F` | 42, 157, 143 | Success, active states |
| **Orchid Purple** | `#9B5DE5` | 155, 93, 229 | VR mode accents |

### Gradients

```css
/* Primary - Deep Ocean */
background: linear-gradient(135deg, #0D3B66 0%, #1A6B7C 50%, #3DA5D9 100%);

/* Sunset Glow */
background: linear-gradient(180deg, #F4A261 0%, #E63946 50%, #0D3B66 100%);

/* Volcanic Mist */
background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #4A4A4A 100%);

/* Loading Shimmer */
background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
```

---

## Typography

### Font Stack

```css
/* Primary - Clean, modern, highly readable */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Display - For location names, slightly warmer */
--font-display: 'DM Sans', 'Inter', sans-serif;

/* Accent - For Hawaiian words, elegant */
--font-accent: 'Lora', Georgia, serif;
```

### Type Scale

| Element | Size | Weight | Line Height | Tracking |
|---------|------|--------|-------------|----------|
| **Hero Title** | 48px / 3rem | 600 | 1.1 | -0.02em |
| **Location Name** | 24px / 1.5rem | 600 | 1.2 | -0.01em |
| **Section Header** | 18px / 1.125rem | 500 | 1.3 | 0 |
| **Body** | 16px / 1rem | 400 | 1.5 | 0 |
| **Caption** | 14px / 0.875rem | 400 | 1.4 | 0.01em |
| **Small/Meta** | 12px / 0.75rem | 500 | 1.4 | 0.02em |

### Hawaiian Language Styling

```css
/* Okina (ʻ) and kahakō (macrons) must display correctly */
.hawaiian-text {
    font-family: var(--font-accent);
    font-style: italic;
    color: var(--seafoam);
}

/* Examples: Hawaiʻi, Kīlauea, Pāhoehoe */
```

---

## Spacing System

Base unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight spacing, icon gaps |
| `--space-2` | 8px | Inline spacing, small gaps |
| `--space-3` | 12px | Control padding |
| `--space-4` | 16px | Standard padding |
| `--space-5` | 24px | Section spacing |
| `--space-6` | 32px | Large gaps |
| `--space-8` | 48px | Panel separation |
| `--space-10` | 64px | Page margins |

---

## UI Components

### Buttons

#### Primary Button
```css
.btn-primary {
    background: linear-gradient(135deg, #1A6B7C, #2A9D8F);
    color: #FAF8F5;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 500;
    font-size: 14px;
    border: none;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 14px rgba(26, 107, 124, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26, 107, 124, 0.4);
}

.btn-primary:active {
    transform: translateY(0);
}
```

#### Ghost Button (for overlays)
```css
.btn-ghost {
    background: rgba(26, 26, 26, 0.6);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: #FAF8F5;
    padding: 12px 20px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-weight: 500;
    transition: all 0.2s ease;
}

.btn-ghost:hover {
    background: rgba(42, 157, 143, 0.2);
    border-color: rgba(42, 157, 143, 0.4);
}
```

#### Icon Button
```css
.btn-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(26, 26, 26, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 20px;
    transition: all 0.2s ease;
}
```

### Toggle Switch (Hawaiian Style)

```css
.toggle {
    width: 52px;
    height: 28px;
    background: linear-gradient(135deg, #2D2D2D, #4A4A4A);
    border-radius: 14px;
    position: relative;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle::after {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    background: linear-gradient(135deg, #FAF8F5, #E0E0E0);
    border-radius: 50%;
    top: 3px;
    left: 3px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.toggle.active {
    background: linear-gradient(135deg, #1A6B7C, #2A9D8F);
}

.toggle.active::after {
    transform: translateX(24px);
}
```

### Panel (Glass Morphism)

```css
.panel {
    background: rgba(26, 26, 26, 0.75);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.panel-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
```

### Slider Control

```css
.slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
}

.slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #2A9D8F 0%, #4A4A4A 100%);
    border-radius: 3px;
    outline: none;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #FAF8F5, #E0E0E0);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
}
```

### Location Card

```css
.location-card {
    background: rgba(26, 26, 26, 0.8);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.3s ease;
}

.location-card:hover {
    transform: translateY(-4px);
    border-color: rgba(42, 157, 143, 0.3);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.location-card-image {
    width: 100%;
    height: 120px;
    object-fit: cover;
}

.location-card-content {
    padding: 16px;
}

.location-card-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 4px;
}

.location-card-subtitle {
    font-size: 14px;
    color: #7FCDCD;
}
```

---

## Animation & Motion

### Timing Functions

```css
/* Gentle entrance - for panels appearing */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);

/* Smooth interaction - for hovers, toggles */
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);

/* Bouncy - for success states, celebrations */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Natural - default for most animations */
--ease-natural: cubic-bezier(0.4, 0, 0.2, 1);
```

### Transition Durations

| Type | Duration | Usage |
|------|----------|-------|
| **Micro** | 100ms | Hover color changes |
| **Fast** | 200ms | Toggles, button states |
| **Normal** | 300ms | Panel transitions |
| **Slow** | 500ms | Page transitions |
| **Panorama** | 1500ms | Location crossfades |

### Entrance Animations

```css
/* Fade up - for panels, cards */
@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Scale in - for modals, focus elements */
@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* Shimmer - for loading states */
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
```

### Particle Effects

- **Rain**: Diagonal streaks, 15-25px length, 0.1-0.3 opacity
- **Mist**: Large blurred circles, slow drift, 0.05-0.15 opacity
- **Vog (volcanic fog)**: Amber-tinted, low opacity, rolling movement
- **Birds**: Occasional silhouettes at distance

---

## Loading States

### Initial Load

```
┌────────────────────────────────────────┐
│                                        │
│         🌴                             │
│     Big Island VR                      │
│                                        │
│    "E hoʻomau i ka ʻimi naʻauao"       │
│    (Continue to seek knowledge)        │
│                                        │
│    ════════════════════════════        │
│    [Progress bar - wave animation]     │
│                                        │
│    Loading Hilo Bayfront...            │
│                                        │
└────────────────────────────────────────┘
```

- Wave animation on progress bar
- Hawaiian proverb rotates every 3 seconds
- Subtle gradient shift in background

### Panorama Transition

- Smooth crossfade (1.5s default)
- Optional: Depth-based morph with parallax
- Brief location name flash at center
- Audio crossfade synchronized

### Skeleton States

```css
.skeleton {
    background: linear-gradient(
        90deg,
        rgba(74, 74, 74, 0.3) 0%,
        rgba(107, 107, 107, 0.3) 50%,
        rgba(74, 74, 74, 0.3) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
    border-radius: 8px;
}
```

---

## Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| **Mobile S** | 320px | iPhone SE |
| **Mobile** | 375px | Standard phones |
| **Mobile L** | 425px | Large phones |
| **Tablet** | 768px | iPad, tablets |
| **Laptop** | 1024px | Small laptops |
| **Desktop** | 1440px | Standard monitors |
| **4K** | 2560px | Large displays |

### Mobile Adaptations

- **Touch targets**: Minimum 44px
- **Bottom navigation**: Primary controls move to bottom
- **Side panels**: Collapse to bottom sheets
- **Gestures**: Swipe left/right for navigation

---

## Accessibility

### Color Contrast

- All text meets WCAG AA (4.5:1 minimum)
- Interactive elements have visible focus states
- Don't rely solely on color for state changes

### Focus States

```css
*:focus-visible {
    outline: 2px solid #3DA5D9;
    outline-offset: 2px;
    border-radius: 4px;
}
```

### Motion Sensitivity

```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
    
    .panorama-transition {
        /* Instant cut instead of crossfade */
    }
}
```

### Screen Reader Support

- Location changes announced via aria-live
- All controls have aria-labels
- Effect states communicated via aria-pressed

---

## Dark Mode (Default)

This app is dark-mode by default (immersive viewing). Light mode not currently planned, but high-contrast mode available:

```css
@media (prefers-contrast: high) {
    :root {
        --panel-bg: rgba(0, 0, 0, 0.9);
        --border-color: rgba(255, 255, 255, 0.3);
        --text-primary: #FFFFFF;
    }
}
```

---

## Design Tokens (CSS Variables)

```css
:root {
    /* Colors - Ocean */
    --color-kona-blue: #0D3B66;
    --color-pacific-teal: #1A6B7C;
    --color-shallow-water: #3DA5D9;
    --color-seafoam: #7FCDCD;
    
    /* Colors - Volcanic */
    --color-lava-black: #1A1A1A;
    --color-pahoehoe: #2D2D2D;
    --color-volcanic-ash: #4A4A4A;
    --color-cinder: #6B6B6B;
    
    /* Colors - Flora */
    --color-plumeria: #FAF8F5;
    --color-hibiscus: #E63946;
    --color-pikake: #F4A261;
    --color-ti-leaf: #2A9D8F;
    --color-orchid: #9B5DE5;
    
    /* Spacing */
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 24px;
    --space-6: 32px;
    --space-8: 48px;
    --space-10: 64px;
    
    /* Typography */
    --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-display: 'DM Sans', var(--font-primary);
    --font-accent: 'Lora', Georgia, serif;
    
    /* Borders */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --radius-full: 9999px;
    
    /* Shadows */
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.4);
    --shadow-glow: 0 0 20px rgba(42, 157, 143, 0.3);
    
    /* Timing */
    --duration-micro: 100ms;
    --duration-fast: 200ms;
    --duration-normal: 300ms;
    --duration-slow: 500ms;
    --duration-panorama: 1500ms;
    
    /* Easing */
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-natural: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

*Mahalo for building with aloha* 🌺
