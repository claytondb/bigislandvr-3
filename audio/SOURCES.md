# Audio Sources for Big Island VR

All audio files used in this project are either CC0 (Public Domain) or licensed under Creative Commons Attribution (CC BY).

## Freesound.org Sources

### Ocean Waves
| Sound | Author | License | URL | Use Case |
|-------|--------|---------|-----|----------|
| Zen Ocean Waves | INNORECORDS | CC0 | https://freesound.org/people/INNORECORDS/sounds/456899/ | Coastal locations |
| Gentle Waves - Quiet Beach | amholma | CC0 | https://freesound.org/people/amholma/sounds/376795/ | Gentle beach ambience |
| Ocean Waves | Noted451 | CC0 | https://freesound.org/people/Noted451/sounds/531015/ | General ocean |
| Gentle Ocean Waves Mix | esh9419 | CC0 | https://freesound.org/people/esh9419/sounds/417797/ | 12-minute track |

### Tropical Birds
| Sound | Author | License | URL | Use Case |
|-------|--------|---------|-----|----------|
| Tropical Birds | InspectorJ | CC BY 4.0 | https://freesound.org/people/InspectorJ/sounds/352515/ | General forest |
| Birds in Rainforest | klankbeeld | CC BY 4.0 | https://freesound.org/people/klankbeeld/sounds/596095/ | Rainforest areas |
| Hawaiian Honeycreeper | xserra | CC0 | https://freesound.org/people/xserra/sounds/95698/ | Native bird calls |
| Morning Birds | sinatra314 | CC0 | https://freesound.org/people/sinatra314/sounds/58237/ | Dawn ambience |

### Rain
| Sound | Author | License | URL | Use Case |
|-------|--------|---------|-----|----------|
| Light Rain | inchadney | CC0 | https://freesound.org/people/inchadney/sounds/104390/ | Light drizzle |
| Rain Heavy | klankbeeld | CC0 | https://freesound.org/people/klankbeeld/sounds/435839/ | Heavy rain |
| Rain on Leaves | InspectorJ | CC BY 4.0 | https://freesound.org/people/InspectorJ/sounds/400632/ | Forest rain |
| Tropical Rain | CGEffex | CC0 | https://freesound.org/people/CGEffex/sounds/98335/ | Hawaiian rain |

### Wind
| Sound | Author | License | URL | Use Case |
|-------|--------|---------|-----|----------|
| Wind Strong | felix.blume | CC0 | https://freesound.org/people/felix.blume/sounds/217506/ | Summit areas |
| Wind Calm | InspectorJ | CC BY 4.0 | https://freesound.org/people/InspectorJ/sounds/405561/ | Light breeze |
| Mountain Wind | kangaroovindaloo | CC0 | https://freesound.org/people/kangaroovindaloo/sounds/205966/ | High elevation |
| Trade Winds | ERH | CC0 | https://freesound.org/people/ERH/sounds/34338/ | Coastal winds |

### Waterfall
| Sound | Author | License | URL | Use Case |
|-------|--------|---------|-----|----------|
| Waterfall Large | InspectorJ | CC BY 4.0 | https://freesound.org/people/InspectorJ/sounds/365915/ | Akaka Falls |
| Waterfall Small | klankbeeld | CC0 | https://freesound.org/people/klankbeeld/sounds/170539/ | Rainbow Falls |
| River Stream | Pfannkucansen | CC0 | https://freesound.org/people/Pfannkucansen/sounds/394566/ | Small streams |

### Volcanic
| Sound | Author | License | URL | Use Case |
|-------|--------|---------|-----|----------|
| Lava Rumble | bone666138 | CC0 | https://freesound.org/people/bone666138/sounds/198879/ | Volcano area |
| Geothermal | akelator | CC0 | https://freesound.org/people/akelator/sounds/175970/ | Steam vents |
| Deep Rumble | Benboncan | CC BY 4.0 | https://freesound.org/people/Benboncan/sounds/91257/ | Distant volcanic |

## CDN Sources (Direct URLs)

For immediate loading without authentication, we use CDN-hosted audio:

```javascript
const AUDIO_URLS = {
    ocean: 'https://cdn.freesound.org/previews/456/456899_6046941-lq.mp3',
    birds: 'https://cdn.freesound.org/previews/352/352515_4164823-lq.mp3',
    rain: 'https://cdn.freesound.org/previews/104/104390_866265-lq.mp3',
    wind: 'https://cdn.freesound.org/previews/217/217506_2493965-lq.mp3',
    waterfall: 'https://cdn.freesound.org/previews/365/365915_6142149-lq.mp3',
    volcanic: 'https://cdn.freesound.org/previews/198/198879_1616430-lq.mp3'
};
```

## Attribution Requirements

When using CC BY licensed sounds, attribution should include:
- Sound name
- Author username
- Link to freesound.org

Example: "Tropical Birds by InspectorJ from freesound.org"

## Notes

- All preview URLs (-lq.mp3) are lower quality but load faster
- For production, consider downloading full quality files
- Freesound.org CDN may have rate limits
- Consider fallback audio hosting (GitHub LFS, S3, etc.)

---
*Last updated: 2026-02-17*
