/**
 * Big Island VR - Educational Content Module
 * Hawaiian language, cultural tips, flora/fauna information
 */

const EducationalContent = {
  // Hawaiian Word of the Day - rotates based on location or time
  hawaiianWords: {
    aloha: {
      word: "Aloha",
      meaning: "Love, affection, peace, compassion, mercy; hello, goodbye",
      pronunciation: "ah-LOH-hah",
      audioUrl: null,
      usage: "Universal greeting expressing warmth and aloha spirit",
      examples: ["Aloha kakahiaka (Good morning)", "Aloha ʻoe (Farewell to you)"]
    },
    mahalo: {
      word: "Mahalo",
      meaning: "Thank you, gratitude, admiration, praise",
      pronunciation: "mah-HAH-loh",
      audioUrl: null,
      usage: "Express appreciation in any situation",
      examples: ["Mahalo nui loa (Thank you very much)"]
    },
    aina: {
      word: "ʻĀina",
      meaning: "Land, earth, that which feeds",
      pronunciation: "EYE-nah",
      audioUrl: null,
      usage: "Refers to the sacred relationship between Hawaiians and the land",
      examples: ["Mālama ʻāina (Care for the land)"]
    },
    mauka: {
      word: "Mauka",
      meaning: "Toward the mountain, inland",
      pronunciation: "MOW-kah",
      audioUrl: null,
      usage: "Directional term used instead of north/south",
      examples: ["The store is mauka of the highway"]
    },
    makai: {
      word: "Makai",
      meaning: "Toward the sea, oceanside",
      pronunciation: "mah-KAI",
      audioUrl: null,
      usage: "Directional term used instead of north/south",
      examples: ["Turn makai at the light"]
    },
    pele: {
      word: "Pele",
      meaning: "Goddess of volcanoes, fire, lightning, wind",
      pronunciation: "PEH-leh",
      audioUrl: null,
      usage: "Central deity in Hawaiian mythology, lives in Kīlauea",
      examples: ["Pele's hair (volcanic glass threads)", "Pele's tears (lava droplets)"]
    },
    ohana: {
      word: "ʻOhana",
      meaning: "Family, extended family, close friends",
      pronunciation: "oh-HAH-nah",
      audioUrl: null,
      usage: "Emphasizes the importance of family bonds - 'ʻOhana means nobody gets left behind'",
      examples: ["Our ʻohana is gathering for a lūʻau"]
    },
    kapu: {
      word: "Kapu",
      meaning: "Sacred, forbidden, taboo",
      pronunciation: "kah-POO",
      audioUrl: null,
      usage: "Refers to ancient Hawaiian system of laws and prohibitions",
      examples: ["This area is kapu (off-limits)"]
    },
    heiau: {
      word: "Heiau",
      meaning: "Temple, place of worship",
      pronunciation: "HEY-ee-ow",
      audioUrl: null,
      usage: "Ancient Hawaiian religious sites - always approach with respect",
      examples: ["Puʻukoholā Heiau was built by Kamehameha"]
    },
    mana: {
      word: "Mana",
      meaning: "Spiritual power, divine power, authority",
      pronunciation: "MAH-nah",
      audioUrl: null,
      usage: "Describes supernatural or spiritual energy inherent in people and places",
      examples: ["The heiau has strong mana"]
    },
    kipuka: {
      word: "Kipuka",
      meaning: "Oasis of older growth surrounded by younger lava",
      pronunciation: "kee-POO-kah",
      audioUrl: null,
      usage: "Island of vegetation spared by lava flows",
      examples: ["Kipuka Ki is visible from Saddle Road"]
    },
    puuhonua: {
      word: "Puʻuhonua",
      meaning: "Place of refuge, sanctuary",
      pronunciation: "poo-oo-hoh-NOO-ah",
      audioUrl: null,
      usage: "Sacred place where lawbreakers could seek forgiveness",
      examples: ["Puʻuhonua o Hōnaunau National Historical Park"]
    },
    waipio: {
      word: "Waipiʻo",
      meaning: "Curved water",
      pronunciation: "why-PEE-oh",
      audioUrl: null,
      usage: "Name of the famous Valley of the Kings",
      examples: ["Waipiʻo Valley was home to Hawaiian royalty"]
    },
    kilauea: {
      word: "Kīlauea",
      meaning: "Spewing, much spreading (referring to lava)",
      pronunciation: "kee-lah-WAY-ah",
      audioUrl: null,
      usage: "Name of the world's most active volcano",
      examples: ["Kīlauea has been erupting since 1983"]
    },
    mauna: {
      word: "Mauna",
      meaning: "Mountain",
      pronunciation: "MOW-nah",
      audioUrl: null,
      usage: "Used in Mauna Kea (White Mountain) and Mauna Loa (Long Mountain)",
      examples: ["Mauna Kea is the tallest peak in Hawaii"]
    },
    honu: {
      word: "Honu",
      meaning: "Green sea turtle",
      pronunciation: "HOH-noo",
      audioUrl: null,
      usage: "Sacred animal in Hawaiian culture, symbol of good luck",
      examples: ["We saw many honu at Punaluʻu Beach"]
    },
    kai: {
      word: "Kai",
      meaning: "Sea, seawater",
      pronunciation: "KAI",
      audioUrl: null,
      usage: "Common element in place names near the ocean",
      examples: ["Kailua means 'two seas'"]
    },
    nalu: {
      word: "Nalu",
      meaning: "Wave, surf",
      pronunciation: "NAH-loo",
      audioUrl: null,
      usage: "Heʻe nalu means 'wave sliding' or surfing",
      examples: ["The nalu was perfect for surfing today"]
    },
    kona: {
      word: "Kona",
      meaning: "Leeward side, south wind",
      pronunciation: "KOH-nah",
      audioUrl: null,
      usage: "Refers to the dry, sunny western coast",
      examples: ["Kona weather brings vog from the volcano"]
    },
    paniolo: {
      word: "Paniolo",
      meaning: "Hawaiian cowboy",
      pronunciation: "pah-nee-OH-loh",
      audioUrl: null,
      usage: "Derived from 'español' - Mexican vaqueros taught Hawaiians ranching",
      examples: ["Waimea is paniolo country"]
    }
  },

  // Cultural Tips for Visitors
  culturalTips: [
    {
      id: "shoes",
      title: "Remove Shoes Indoors",
      icon: "👟",
      description: "Always remove your shoes before entering someone's home or certain establishments. This keeps the home clean and is a sign of respect. Look for piles of slippers (zoris) at the entrance.",
      importance: "essential"
    },
    {
      id: "sacred",
      title: "Respect Sacred Sites",
      icon: "🙏",
      description: "Many places are considered sacred (kapu). Follow posted signs, stay on marked trails, and never move or take rocks from heiau (temples). If you see offerings (ti leaves, flowers, wrapped stones), do not disturb them.",
      importance: "essential"
    },
    {
      id: "rocks",
      title: "Don't Take Lava Rocks",
      icon: "🪨",
      description: "Legend says taking lava rocks brings bad luck from Pele, goddess of volcanoes. The National Park Service receives thousands of returned rocks yearly from people who experienced misfortune. Leave natural items where you find them.",
      importance: "important"
    },
    {
      id: "shaka",
      title: "Give the Shaka",
      icon: "🤙",
      description: "The shaka (thumb and pinky extended, other fingers curled) is the universal Hawaiian greeting. It means 'hang loose' and spreads aloha spirit. Use it when thanking drivers, greeting friends, or just sharing good vibes.",
      importance: "fun"
    },
    {
      id: "driving",
      title: "Drive with Aloha",
      icon: "🚗",
      description: "Let others merge, don't honk unnecessarily, and wave thank you. Island time is real - slow down and enjoy the journey. Locals may drive slower than mainlanders, and that's okay.",
      importance: "important"
    },
    {
      id: "turtles",
      title: "Respect Sea Turtles",
      icon: "🐢",
      description: "Honu (sea turtles) are protected by federal law. Keep at least 10 feet away, never touch them, and don't disturb them while resting on beaches. Fines can reach $100,000. Just observe quietly.",
      importance: "essential"
    },
    {
      id: "pronunciation",
      title: "Learn Basic Hawaiian Words",
      icon: "🗣️",
      description: "Locals appreciate when visitors try to pronounce place names correctly. Every vowel is pronounced, and the ʻokina (ʻ) is a glottal stop. Practice: Hawaiʻi (ha-VAI-ee), Kīlauea (kee-lah-WAY-ah).",
      importance: "helpful"
    },
    {
      id: "local",
      title: "Support Local",
      icon: "🛍️",
      description: "Buy from local farmers markets, eat at local restaurants, and purchase from local artisans. This directly supports the community and provides a more authentic experience than chain stores.",
      importance: "helpful"
    },
    {
      id: "malama",
      title: "Mālama ʻĀina (Care for the Land)",
      icon: "🌱",
      description: "Pack out what you pack in, use reef-safe sunscreen, and don't disturb wildlife or plants. Leave places better than you found them. The ʻāina provides for us; we must care for it in return.",
      importance: "essential"
    },
    {
      id: "photos",
      title: "Ask Before Taking Photos",
      icon: "📷",
      description: "It's respectful to ask permission before photographing people, especially at cultural events or ceremonies. Some places may also restrict photography - look for signs.",
      importance: "helpful"
    }
  ],

  // Flora Information
  flora: [
    {
      id: "ohia",
      name: "ʻŌhiʻa Lehua",
      hawaiianName: "ʻŌhiʻa Lehua",
      scientificName: "Metrosideros polymorpha",
      icon: "🌺",
      description: "Endemic tree with beautiful red flowers. First plant to colonize new lava flows. Sacred to Pele - legend says picking the flower brings rain (Lehua was separated from her love ʻŌhiʻa by Pele, and her tears become rain).",
      whereToSee: ["Volcano", "Rainforest", "Saddle Road"],
      funFact: "Can grow as a small shrub on new lava or a 100-foot tree in old forest"
    },
    {
      id: "koa",
      name: "Koa",
      hawaiianName: "Koa",
      scientificName: "Acacia koa",
      icon: "🌳",
      description: "Hawaii's largest native tree, prized for its beautiful curly wood used in furniture, ukuleles, and traditional canoes. Can grow to 100 feet tall with a trunk 10 feet in diameter.",
      whereToSee: ["Hamakua", "Volcano", "Kohala Mountains"],
      funFact: "Ancient Hawaiian warriors crafted weapons and surfboards from koa wood"
    },
    {
      id: "hapuu",
      name: "Hapuʻu Fern",
      hawaiianName: "Hapuʻu",
      scientificName: "Cibotium glaucum",
      icon: "🌿",
      description: "Giant tree fern that creates the distinctive rainforest canopy. Can grow 20 feet tall with fronds up to 15 feet long. Pulu (soft fiber at base of fronds) was historically used for stuffing mattresses.",
      whereToSee: ["Volcano", "Hamakua", "Hilo forests"],
      funFact: "A single frond can weigh 20 pounds"
    },
    {
      id: "ti",
      name: "Ti Plant",
      hawaiianName: "Kī",
      scientificName: "Cordyline fruticosa",
      icon: "🌿",
      description: "Sacred plant used for spiritual protection, lei making, and wrapping food for cooking in imu (underground oven). Green ti is most traditional; red varieties are also common.",
      whereToSee: ["Gardens", "Residential areas", "Forest edges"],
      funFact: "Planted around homes for good luck and spiritual protection"
    },
    {
      id: "plumeria",
      name: "Plumeria",
      hawaiianName: "Melia",
      scientificName: "Plumeria rubra",
      icon: "🌸",
      description: "Fragrant flowers used in lei making. Not native but deeply associated with Hawaii. Blooms year-round in white, yellow, pink, and red. The scent is unmistakably Hawaiian.",
      whereToSee: ["Gardens", "Resorts", "Residential areas"],
      funFact: "Also called 'frangipani' - its sap was used as glue in ancient times"
    },
    {
      id: "birdofparadise",
      name: "Bird of Paradise",
      hawaiianName: "Bird of Paradise",
      scientificName: "Strelitzia reginae",
      icon: "🦜",
      description: "Striking orange and blue flowers resembling tropical birds in flight. Popular in landscaping and flower arrangements. Native to South Africa but thrives in Hawaii.",
      whereToSee: ["Gardens", "Resorts", "Hilo"],
      funFact: "Each flower can produce up to 20 nectar-filled florets"
    },
    {
      id: "naupaka",
      name: "Naupaka",
      hawaiianName: "Naupaka",
      scientificName: "Scaevola spp.",
      icon: "🌼",
      description: "Half-flower shaped plant found both on beaches and mountains. Legend tells of separated lovers Naupaka and Kaui whose flowers are reunited when beach and mountain varieties are placed together.",
      whereToSee: ["Beaches (naupaka kahakai)", "Mountains (naupaka kuahiwi)"],
      funFact: "The two species' half-flowers fit together perfectly when combined"
    },
    {
      id: "silversword",
      name: "Silversword",
      hawaiianName: "ʻĀhinahina",
      scientificName: "Argyroxiphium sandwicense",
      icon: "🌵",
      description: "Extremely rare plant found only on Mauna Kea and Haleakalā. Silver leaves reflect intense sunlight at high elevation. Blooms once after 15-50 years, producing hundreds of maroon flowers, then dies.",
      whereToSee: ["Mauna Kea (above 9,000 ft)"],
      funFact: "Once nearly extinct; now protected and recovering"
    }
  ],

  // Fauna Information
  fauna: [
    {
      id: "honu",
      name: "Honu (Green Sea Turtle)",
      hawaiianName: "Honu",
      scientificName: "Chelonia mydas",
      icon: "🐢",
      description: "Sacred in Hawaiian culture, symbol of good luck and longevity. Protected species. Often seen basking on beaches or feeding on algae near shore. Can live 80+ years.",
      whereToSee: ["Punalu'u Beach", "Kahalu'u Beach", "Kona Coast"],
      bestTime: "Year-round, especially morning hours",
      guidelines: "Stay 10 feet away, never touch, don't block path to water"
    },
    {
      id: "whale",
      name: "Humpback Whale",
      hawaiianName: "Koholā",
      scientificName: "Megaptera novaeangliae",
      icon: "🐋",
      description: "Migrate from Alaska to Hawaii each winter to breed and give birth. Males sing complex songs that can last 20 minutes. Can grow to 60 feet and 40 tons.",
      whereToSee: ["Kona Coast", "Kohala Coast", "Any coastal area"],
      bestTime: "November to May, peak in February-March",
      guidelines: "Federal law requires 100-yard distance from boats"
    },
    {
      id: "dolphin",
      name: "Spinner Dolphin",
      hawaiianName: "Nai'a",
      scientificName: "Stenella longirostris",
      icon: "🐬",
      description: "Named for acrobatic spinning leaps - can rotate up to 7 times in a single jump. Rest in shallow bays during the day, hunt at night. Travel in pods of up to 200.",
      whereToSee: ["Kealakekua Bay", "Honaunau Bay", "Kona Coast"],
      bestTime: "Morning (they rest midday, so observe from distance)",
      guidelines: "New regulations limit approach distance; don't swim with resting dolphins"
    },
    {
      id: "manta",
      name: "Manta Ray",
      hawaiianName: "Hahalua",
      scientificName: "Mobula alfredi",
      icon: "🦋",
      description: "Graceful filter feeders with wingspans up to 12 feet. Feed on plankton attracted by lights at night. Completely harmless - no stinger. Each has unique spot patterns for identification.",
      whereToSee: ["Keauhou Bay", "Kona Coast"],
      bestTime: "Night (sunset snorkel/dive tours)",
      guidelines: "Don't touch; let them approach you"
    },
    {
      id: "monkseal",
      name: "Hawaiian Monk Seal",
      hawaiianName: "ʻĪlioholoikauaua",
      scientificName: "Neomonachus schauinslandi",
      icon: "🦭",
      description: "Critically endangered - only about 1,400 remain. One of only two remaining monk seal species (Mediterranean is the other). Hawaiian name means 'dog running in rough seas.'",
      whereToSee: ["Remote beaches (rare on Big Island)"],
      bestTime: "Random sightings - they haul out to rest",
      guidelines: "Stay 50 feet away; report sightings to NOAA"
    },
    {
      id: "nene",
      name: "Nēnē (Hawaiian Goose)",
      hawaiianName: "Nēnē",
      scientificName: "Branta sandvicensis",
      icon: "🦆",
      description: "State bird of Hawaii. Nearly went extinct in 1952 (only 30 birds remained). Now recovering through conservation - over 3,000 exist. Descended from Canada geese that arrived 500,000 years ago.",
      whereToSee: ["Volcano", "Mauna Kea", "Golf courses"],
      bestTime: "Year-round; most active morning and evening",
      guidelines: "Don't feed; watch for them crossing roads"
    },
    {
      id: "iiwi",
      name: "ʻIʻiwi (Scarlet Honeycreeper)",
      hawaiianName: "ʻIʻiwi",
      scientificName: "Drepanis coccinea",
      icon: "🐦",
      description: "Brilliant red bird with distinctive curved bill for extracting nectar from ʻōhiʻa flowers. Once common throughout Hawaii, now declining due to avian malaria carried by mosquitoes.",
      whereToSee: ["High elevation forests (above 4,000 ft)", "Volcano", "Mauna Kea slopes"],
      bestTime: "Dawn when ʻōhiʻa is blooming",
      guidelines: "Bring binoculars; they stay high in canopy"
    },
    {
      id: "io",
      name: "ʻIo (Hawaiian Hawk)",
      hawaiianName: "ʻIo",
      scientificName: "Buteo solitarius",
      icon: "🦅",
      description: "Endemic hawk found only on Big Island. Considered ʻaumakua (family guardian spirit) by some Hawaiian families. Can have light or dark color phases.",
      whereToSee: ["Forests island-wide", "Hamakua", "Volcano"],
      bestTime: "Daytime; often seen soaring or perched on power lines",
      guidelines: "Protected species; admire from distance"
    }
  ],

  // Seasonal Information
  seasons: {
    merrie_monarch: {
      name: "Merrie Monarch Festival",
      icon: "💃",
      dates: "One week after Easter (usually April)",
      description: "The world's premier hula competition and celebration of Hawaiian culture. Named after King David Kalākaua who revived Hawaiian culture.",
      tips: [
        "Book Hilo accommodations 6-12 months in advance",
        "Competition tickets sell out within minutes - enter lottery",
        "Free events include craft fair, parade, and hoʻolauleʻa (party)",
        "Hilo transforms with decorations, lei stands, and festivities"
      ],
      locations: ["Downtown Hilo", "Banyan Drive", "Edith Kanaka'ole Stadium"]
    },
    whale_season: {
      name: "Whale Watching Season",
      icon: "🐋",
      months: "November to May (peak: January-March)",
      description: "Humpback whales migrate from Alaska to breed and give birth in Hawaii's warm, protected waters.",
      tips: [
        "Look for 'blows' (spouts) on the horizon - visible from 2 miles away",
        "Best viewing from elevated coastal points",
        "Morning usually offers calmer seas and better visibility",
        "Binoculars greatly enhance the experience",
        "Whale watching tours depart from Kona and Kawaihae"
      ],
      fun_facts: [
        "Calves gain 100 pounds per day on mother's milk",
        "Only male whales sing (songs can last 20 minutes)",
        "They don't eat while in Hawaii - fast for 5 months",
        "Same whales often return to Hawaii year after year"
      ]
    },
    volcanic_activity: {
      name: "Volcanic Activity",
      icon: "🌋",
      description: "Kīlauea is one of the world's most active volcanoes. Activity level varies from quiet to spectacular eruptions.",
      current_status_url: "https://www.usgs.gov/volcanoes/kilauea",
      tips: [
        "Check nps.gov/havo and USGS for current conditions",
        "Volcanic gases (vog) can affect air quality - check forecasts",
        "Stay on marked trails and never enter closed areas",
        "Volcanic activity can change rapidly",
        "During active eruptions, glow is best seen after dark"
      ]
    },
    flower_seasons: {
      spring: {
        months: "March-May",
        blooms: ["Jacaranda (purple - especially Hilo/Saddle Road)", "Rainbow Shower Tree", "Plumeria (starting)"],
        description: "Jacaranda trees paint hillsides purple, especially along Saddle Road and in Hilo"
      },
      summer: {
        months: "June-August",
        blooms: ["Plumeria (peak)", "Royal Poinciana (red)", "Hibiscus", "Ginger varieties"],
        description: "Peak plumeria season - gardens are most fragrant"
      },
      fall: {
        months: "September-November",
        blooms: ["Hibiscus", "Bird of Paradise", "Orchids"],
        description: "State flower (yellow hibiscus) blooms abundantly"
      },
      winter: {
        months: "December-February",
        blooms: ["Poinsettia", "Anthuriums", "Orchids", "Protea"],
        description: "Holiday season brings poinsettias; Hilo orchid farms bloom year-round"
      }
    }
  },

  // Helper functions
  getRandomWord() {
    const words = Object.values(this.hawaiianWords);
    return words[Math.floor(Math.random() * words.length)];
  },

  getWordForLocation(locationName) {
    // Return a relevant Hawaiian word based on location
    const locationWords = {
      "volcano": "pele",
      "beach": "kai",
      "mountain": "mauna",
      "waterfall": "waiānuenue",
      "bay": "kai",
      "valley": "waipio",
      "heiau": "heiau"
    };
    
    for (const [keyword, wordKey] of Object.entries(locationWords)) {
      if (locationName.toLowerCase().includes(keyword)) {
        return this.hawaiianWords[wordKey];
      }
    }
    return this.getRandomWord();
  },

  getTipOfTheDay() {
    const today = new Date().getDate();
    return this.culturalTips[today % this.culturalTips.length];
  },

  getFloraForLocation(regionOrLocationType) {
    // Filter flora by where they can be seen
    return this.flora.filter(plant => 
      plant.whereToSee.some(place => 
        place.toLowerCase().includes(regionOrLocationType.toLowerCase())
      )
    );
  },

  getFaunaForLocation(regionOrLocationType) {
    // Filter fauna by where they can be seen
    return this.fauna.filter(animal => 
      animal.whereToSee.some(place => 
        place.toLowerCase().includes(regionOrLocationType.toLowerCase())
      )
    );
  },

  isWhaleWatchingSeason() {
    const month = new Date().getMonth() + 1; // 1-12
    return month >= 11 || month <= 5;
  },

  getCurrentFlowerSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return this.seasons.flower_seasons.spring;
    if (month >= 6 && month <= 8) return this.seasons.flower_seasons.summer;
    if (month >= 9 && month <= 11) return this.seasons.flower_seasons.fall;
    return this.seasons.flower_seasons.winter;
  }
};

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EducationalContent;
}
