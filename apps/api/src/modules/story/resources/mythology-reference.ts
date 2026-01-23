/**
 * Mythology Reference Resource
 *
 * Comprehensive mythology database for fantasy story generation.
 * Includes both common and exotic mythological traditions.
 */

// =============================================================================
// COMMON MYTHOLOGIES
// =============================================================================

export const GREEK_MYTHOLOGY = {
  name: 'Greek/Roman',
  cosmology: {
    structure: 'Three realms: Olympus (sky), Earth, Underworld (Hades)',
    creation: 'Chaos → Primordials → Titans → Olympians',
    worldTree: null,
  },
  gods: {
    supreme: ['Zeus/Jupiter (Sky, Thunder)', 'Poseidon/Neptune (Sea)', 'Hades/Pluto (Underworld)'],
    major: ['Athena (Wisdom, War)', 'Apollo (Sun, Music)', 'Artemis (Moon, Hunt)', 'Ares (War)', 'Aphrodite (Love)', 'Hephaestus (Forge)', 'Hermes (Messengers)', 'Dionysus (Wine)'],
    primordial: ['Gaia (Earth)', 'Uranus (Sky)', 'Chronos (Time)', 'Nyx (Night)', 'Erebus (Darkness)'],
  },
  creatures: ['Hydra', 'Cerberus', 'Minotaur', 'Medusa', 'Cyclops', 'Centaur', 'Pegasus', 'Phoenix', 'Chimera', 'Sphinx'],
  concepts: {
    fate: 'The Moirai (Fates) - Clotho, Lachesis, Atropos',
    afterlife: 'Elysium (paradise), Asphodel (neutral), Tartarus (punishment)',
    heroism: 'Demigods, divine quests, tragic flaws (hubris)',
  },
  storyElements: ['Divine jealousy', 'Prophecy fulfillment', 'Metamorphosis', 'Tragic heroes', 'Monster slaying', 'Underworld journeys'],
};

export const NORSE_MYTHOLOGY = {
  name: 'Norse/Germanic',
  cosmology: {
    structure: 'Nine Realms connected by Yggdrasil (World Tree)',
    realms: ['Asgard (Gods)', 'Midgard (Humans)', 'Jotunheim (Giants)', 'Niflheim (Ice)', 'Muspelheim (Fire)', 'Vanaheim (Vanir)', 'Alfheim (Elves)', 'Svartalfheim (Dwarves)', 'Helheim (Dead)'],
    creation: 'Ice and Fire meeting → Ymir → Gods from his body',
    apocalypse: 'Ragnarok - The Twilight of the Gods',
  },
  gods: {
    aesir: ['Odin (Wisdom, War, Death)', 'Thor (Thunder)', 'Tyr (Justice)', 'Baldur (Light)', 'Heimdall (Guardian)'],
    vanir: ['Freya (Love, Magic)', 'Freyr (Fertility)', 'Njord (Sea)'],
    trickster: 'Loki (Chaos, Fire, Lies)',
  },
  creatures: ['Dragons (Nidhogg)', 'Fenrir (Wolf)', 'Jormungandr (World Serpent)', 'Valkyries', 'Draugr (Undead)', 'Einherjar (Chosen Warriors)', 'Trolls', 'Dwarves'],
  concepts: {
    fate: 'Norns (Urd, Verdandi, Skuld) at the Well of Fate',
    afterlife: 'Valhalla (warriors), Folkvangr (chosen by Freya), Helheim (others)',
    honor: 'Warrior culture, glorious death, oath-keeping',
  },
  storyElements: ['Inevitable doom', 'Sacrifice for wisdom', 'Brothers in arms', 'Shape-shifting', 'Runic magic', 'Blood feuds'],
};

export const EAST_ASIAN_MYTHOLOGY = {
  name: 'East Asian (Chinese/Japanese/Korean)',
  cosmology: {
    chinese: 'Heavenly Court, Mortal Realm, Underworld (Diyu)',
    japanese: 'Takamagahara (Heaven), Ashihara no Nakatsukuni (Earth), Yomi (Underworld)',
    elements: 'Five Elements (Wood, Fire, Earth, Metal, Water)',
    balance: 'Yin and Yang, Heaven and Earth',
  },
  gods: {
    chinese: ['Jade Emperor', 'Queen Mother of the West', 'Guan Yu (War)', 'Nezha', 'Sun Wukong (Monkey King)'],
    japanese: ['Amaterasu (Sun)', 'Susanoo (Storms)', 'Tsukuyomi (Moon)', 'Izanagi/Izanami (Creation)'],
    concepts: ['Dragon Kings', 'Kitchen God', 'Door Gods', 'City Gods'],
  },
  creatures: {
    chinese: ['Dragons (Lung)', 'Phoenix (Fenghuang)', 'Qilin', 'Tortoise (Gui)', 'Nine-Tailed Fox', 'Jiangshi (Vampire)'],
    japanese: ['Yokai', 'Kitsune (Fox)', 'Tengu', 'Oni', 'Kappa', 'Tanuki', 'Dragons (Ryu)'],
  },
  concepts: {
    cultivation: 'Achieving immortality through spiritual practice',
    karma: 'Actions determining rebirth and fate',
    filialPiety: 'Respect for ancestors and elders',
    mandate: 'Mandate of Heaven for rulers',
  },
  storyElements: ['Journey to immortality', 'Heavenly bureaucracy', 'Demon subjugation', 'Transformation tales', 'Karmic justice', 'Master-disciple relationships'],
};

export const EGYPTIAN_MYTHOLOGY = {
  name: 'Egyptian',
  cosmology: {
    structure: 'Duat (Underworld), Earth, Sky (Nut\'s body)',
    creation: 'Atum emerged from Nun (primordial waters)',
    cycle: 'Ra\'s daily journey through sky and underworld',
  },
  gods: {
    major: ['Ra (Sun)', 'Osiris (Death, Afterlife)', 'Isis (Magic)', 'Horus (Sky)', 'Set (Chaos)', 'Anubis (Embalming)', 'Thoth (Wisdom)', 'Bastet (Cats)'],
    primordial: ['Nun (Chaos Waters)', 'Atum (Creator)', 'Shu (Air)', 'Tefnut (Moisture)', 'Geb (Earth)', 'Nut (Sky)'],
  },
  creatures: ['Sphinxes', 'Ammit (Soul Devourer)', 'Serpent Apophis', 'Bennu Bird (Phoenix)', 'Scarabs', 'Mummies'],
  concepts: {
    soul: 'Ka (life force), Ba (personality), Akh (immortal self)',
    judgment: 'Heart weighed against Ma\'at\'s feather',
    afterlife: 'Field of Reeds (paradise for worthy souls)',
    magic: 'Heka - the power of words and names',
  },
  storyElements: ['Divine kingship', 'Mummification and preservation', 'True names holding power', 'Cosmic battles', 'Animal-headed beings', 'Pyramid mysteries'],
};

export const HINDU_MYTHOLOGY = {
  name: 'Hindu',
  cosmology: {
    structure: 'Multiple lokas (realms) in cosmic hierarchy',
    cycles: 'Yugas (ages) cycling through creation and destruction',
    trimurti: 'Brahma (Creator), Vishnu (Preserver), Shiva (Destroyer)',
  },
  gods: {
    trimurti: ['Brahma', 'Vishnu (and avatars: Rama, Krishna)', 'Shiva'],
    major: ['Saraswati (Knowledge)', 'Lakshmi (Fortune)', 'Parvati (Power)', 'Ganesha (Obstacles)', 'Hanuman (Devotion)', 'Kali (Time, Death)'],
    concepts: ['Devas (Gods)', 'Asuras (Anti-gods)', 'Avatars (Divine incarnations)'],
  },
  creatures: ['Nagas (Serpent beings)', 'Garuda (Divine eagle)', 'Rakshasas (Demons)', 'Yakshas (Nature spirits)', 'Gandharvas (Celestial musicians)'],
  concepts: {
    dharma: 'Cosmic order and duty',
    karma: 'Actions and their consequences',
    moksha: 'Liberation from the cycle of rebirth',
    maya: 'Illusion of the material world',
  },
  storyElements: ['Avatars descending to save world', 'Cosmic dances', 'Meditation and asceticism', 'Divine weapons (Astras)', 'Epic wars', 'Cycles of time'],
};

// =============================================================================
// EXOTIC/UNDERUTILIZED MYTHOLOGIES
// =============================================================================

export const AFRICAN_MYTHOLOGIES = {
  yoruba: {
    name: 'Yoruba (West African)',
    cosmology: {
      structure: 'Orun (heaven) and Aye (earth)',
      creation: 'Olodumare sent Orishas to create earth',
    },
    gods: {
      supreme: 'Olodumare (Creator)',
      orishas: ['Shango (Thunder, Lightning)', 'Oshun (Rivers, Love)', 'Yemoja (Ocean, Motherhood)', 'Ogun (Iron, War)', 'Eshu (Crossroads, Trickster)', 'Obatala (Creation)', 'Oya (Winds, Change)'],
    },
    concepts: {
      ashe: 'Divine energy/power in all things',
      ori: 'Personal destiny and consciousness',
      divination: 'Ifa system of prophecy',
    },
    storyElements: ['Divine possession', 'Crossroads choices', 'River spirits', 'Iron and technology', 'Ancestor communication'],
  },
  akan: {
    name: 'Akan/Ashanti (Ghana)',
    gods: {
      supreme: 'Nyame (Sky God)',
      others: ['Asase Ya (Earth)', 'Anansi (Spider Trickster)'],
    },
    concepts: {
      sunsum: 'Spirit/soul',
      kra: 'Life force from Nyame',
    },
    storyElements: ['Trickster tales', 'Spider wisdom', 'Golden Stool (divine kingship)', 'Proverbs and riddles'],
  },
};

export const MESOAMERICAN_MYTHOLOGIES = {
  aztec: {
    name: 'Aztec/Mexica',
    cosmology: {
      structure: 'Thirteen heavens, earth, nine underworlds (Mictlan)',
      suns: 'Five Suns (world ages) - current is Fifth Sun',
      creation: 'Gods sacrificed themselves to create the sun',
    },
    gods: {
      major: ['Quetzalcoatl (Feathered Serpent)', 'Tezcatlipoca (Smoking Mirror)', 'Huitzilopochtli (War, Sun)', 'Tlaloc (Rain)', 'Mictlantecuhtli (Death)'],
      concepts: ['Dual nature of deities', 'Divine sacrifice'],
    },
    creatures: ['Feathered Serpents', 'Jaguar Warriors', 'Eagle Warriors', 'Xibalba creatures'],
    concepts: {
      sacrifice: 'Blood sustains the cosmos',
      calendars: 'Sacred 260-day and solar 365-day cycles',
      duality: 'Life/death, creation/destruction',
    },
    storyElements: ['Sun sacrifices', 'Jaguar transformation', 'Underworld journeys', 'Calendar prophecies', 'Feathered serpent wisdom'],
  },
  maya: {
    name: 'Maya',
    cosmology: {
      structure: 'World Tree connecting heaven, earth, underworld',
      creation: 'Popol Vuh - gods creating humans from maize',
      underworld: 'Xibalba - realm of death lords',
    },
    gods: ['Itzamna (Creator)', 'Kukulkan (Feathered Serpent)', 'Chaac (Rain)', 'Ah Puch (Death)', 'Hero Twins'],
    concepts: {
      ballGame: 'Sacred sport with cosmic significance',
      bloodletting: 'Royal ritual for divine communication',
      astronomy: 'Stars as gods and prophecy',
    },
    storyElements: ['Hero Twins defeating death', 'Ball game championships', 'Star prophecies', 'Maize transformations'],
  },
};

export const POLYNESIAN_MYTHOLOGY = {
  name: 'Polynesian (Hawaiian, Māori, Samoan)',
  cosmology: {
    creation: 'Void (Po) → Light (Ao) → Gods → Humans',
    structure: 'Many-layered heavens and underworlds',
  },
  gods: {
    hawaiian: ['Kane (Creation)', 'Ku (War)', 'Lono (Peace)', 'Kanaloa (Ocean)', 'Pele (Volcanoes)'],
    maori: ['Rangi (Sky Father)', 'Papa (Earth Mother)', 'Tane (Forests)', 'Tu (War)', 'Tangaroa (Sea)'],
  },
  concepts: {
    mana: 'Spiritual power/authority (ORIGINAL SOURCE of the concept)',
    tapu: 'Sacred/forbidden (taboo)',
    mauri: 'Life force in all things',
  },
  creatures: ['Menehune (Little people)', 'Mo\'o (Lizard spirits)', 'Taniwha (Water monsters)', 'Tiki (First human/statue spirits)'],
  storyElements: ['Volcano goddesses', 'Ocean voyaging', 'Demigod heroes (Maui)', 'Star navigation', 'Tattoo magic', 'Ancestor power'],
};

export const SLAVIC_MYTHOLOGY = {
  name: 'Slavic (Russian, Polish, Czech)',
  cosmology: {
    structure: 'World Tree with three realms',
    duality: 'Perun (Sky) vs Veles (Underworld)',
  },
  gods: {
    major: ['Perun (Thunder)', 'Veles (Underworld, Cattle)', 'Svarog (Sky, Fire)', 'Dazhbog (Sun)', 'Mokosh (Earth, Fate)'],
  },
  creatures: {
    spirits: ['Domovoi (House spirit)', 'Leshy (Forest spirit)', 'Vodyanoy (Water spirit)', 'Rusalka (Water maidens)'],
    monsters: ['Baba Yaga (Witch)', 'Koschei the Deathless', 'Zmey (Dragon)', 'Firebird'],
  },
  concepts: {
    dualFaith: 'Pagan beliefs merged with Christianity',
    nature: 'Every natural feature has a spirit',
  },
  storyElements: ['Koschei\'s hidden death', 'Baba Yaga\'s chicken-legged hut', 'Firebird quests', 'Ivan the Fool victories', 'Forest spirits bargains'],
};

export const CELTIC_MYTHOLOGY = {
  name: 'Celtic (Irish, Welsh, Scottish)',
  cosmology: {
    otherworld: 'Tír na nÓg (Land of Youth), Annwn (Welsh underworld)',
    thinPlaces: 'Boundaries between worlds',
  },
  gods: {
    irish: {
      tuatha: ['Dagda (Good God)', 'Lugh (Light, Skill)', 'Brigid (Fire, Poetry)', 'Morrigan (War, Fate)', 'Danu (Mother)'],
    },
    welsh: ['Arawn (Annwn)', 'Rhiannon (Horses)', 'Math', 'Gwydion'],
  },
  creatures: ['Sidhe (Fairy folk)', 'Banshee', 'Selkie', 'Kelpie', 'Púca', 'Leprechaun', 'Aos Sí'],
  concepts: {
    geas: 'Sacred prohibition/obligation',
    sovereignty: 'Divine right through goddess marriage',
    cycles: 'Mythological, Ulster, Fenian, Historical cycles',
  },
  storyElements: ['Fairy abductions', 'Time flowing differently', 'Geas violations', 'Hero\'s salmon of knowledge', 'Cauldrons of plenty', 'Shapeshifting'],
};

export const PERSIAN_MYTHOLOGY = {
  name: 'Persian/Zoroastrian',
  cosmology: {
    dualism: 'Ahura Mazda (Good) vs Angra Mainyu (Evil)',
    creation: 'Cosmic battle between light and darkness',
    time: 'Linear progression toward final renovation',
  },
  beings: {
    good: ['Ahura Mazda (Wise Lord)', 'Amesha Spentas (Holy Immortals)', 'Yazatas (Worthy of worship)'],
    evil: ['Angra Mainyu (Destructive Spirit)', 'Daevas (Demons)', 'Divs'],
  },
  creatures: ['Simurgh (Divine bird)', 'Divs (Demons)', 'Peris (Fairy-like beings)'],
  concepts: {
    asha: 'Truth and cosmic order',
    druj: 'Lie and chaos',
    fravashi: 'Guardian spirits',
  },
  heroes: ['Rostam (Champion)', 'Zal (White-haired hero)', 'Key Khosrow (King)'],
  storyElements: ['Light vs. darkness battles', 'Divine bird guidance', 'Champion wrestling demons', 'Fire temples', 'Truth magic'],
};

export const MESOPOTAMIAN_MYTHOLOGY = {
  name: 'Mesopotamian (Sumerian, Babylonian, Akkadian)',
  cosmology: {
    creation: 'Enuma Elish - Marduk slaying Tiamat',
    structure: 'Heaven (An), Earth (Ki), Underworld (Kur)',
  },
  gods: {
    sumerian: ['An (Sky)', 'Enlil (Air, Storm)', 'Enki (Water, Wisdom)', 'Inanna (Love, War)', 'Nanna (Moon)'],
    babylonian: ['Marduk (Chief god)', 'Ishtar (Inanna)', 'Shamash (Sun, Justice)', 'Tiamat (Primordial chaos)'],
  },
  creatures: ['Tiamat (Chaos dragon)', 'Anzu (Storm bird)', 'Pazuzu (Demon)', 'Lamassu (Guardian)', 'Scorpion people'],
  concepts: {
    me: 'Divine decrees/powers that govern civilization',
    tablets: 'Tablets of Destiny controlling fate',
    divination: 'Omens from gods',
  },
  heroes: ['Gilgamesh (Epic hero)', 'Enkidu (Wild man)', 'Utnapishtim (Flood survivor)'],
  storyElements: ['Quest for immortality', 'Underworld descents', 'Flood narratives', 'Civilization vs. wilderness', 'Divine combat', 'Fate tablets'],
};

// =============================================================================
// MYTHOLOGY BLENDING GUIDE
// =============================================================================

export const MYTHOLOGY_BLENDING_GUIDE = {
  description: 'Guidelines for combining mythological elements',

  compatiblePairings: [
    {
      pair: ['Greek', 'Norse'],
      commonElements: 'Pantheon structure, heroic quests, tragic fate',
      blendIdea: 'Olympians and Aesir as rival divine factions',
    },
    {
      pair: ['Egyptian', 'Mesopotamian'],
      commonElements: 'River civilizations, underworld journeys, divine kingship',
      blendIdea: 'Unified ancient empire with both pantheons',
    },
    {
      pair: ['Celtic', 'Slavic'],
      commonElements: 'Nature spirits, otherworld, shapeshifting',
      blendIdea: 'Pan-European fairy realm connected by ancient forests',
    },
    {
      pair: ['East Asian', 'Hindu'],
      commonElements: 'Karma, reincarnation, hierarchical heavens',
      blendIdea: 'Unified Eastern spiritual cultivation system',
    },
    {
      pair: ['Aztec', 'Norse'],
      commonElements: 'Apocalyptic cycles, blood sacrifice, warrior culture',
      blendIdea: 'Twin worlds approaching mutual apocalypse',
    },
    {
      pair: ['African', 'Caribbean'],
      commonElements: 'Orishas carried across ocean, ancestor spirits',
      blendIdea: 'Diaspora magic systems reconnecting',
    },
  ],

  universalElements: {
    creation: 'Chaos → Order, usually through divine conflict',
    flood: 'Great flood destroying previous world',
    trickster: 'Clever being who breaks rules (Loki, Anansi, Coyote)',
    underworld: 'Realm of the dead, often journey destination',
    worldTree: 'Axis mundi connecting realms',
    heroJourney: 'Mortal achieving divine feats',
  },

  differentiators: {
    fate: {
      greek: 'Unchangeable, even gods bound',
      norse: 'Known but still fought against',
      hindu: 'Karma-based, can be changed',
      chinese: 'Mandate can shift',
    },
    afterlife: {
      greek: 'Differentiated (good/neutral/bad)',
      norse: 'Warrior selection vs. common dead',
      egyptian: 'Judgment-based entrance',
      hindu: 'Reincarnation cycle',
    },
    magic: {
      greek: 'Divine gifts or curses',
      norse: 'Runes, seidr, sacrifice for wisdom',
      egyptian: 'True names, hieroglyphic power',
      celtic: 'Nature connection, geas',
    },
  },
};
