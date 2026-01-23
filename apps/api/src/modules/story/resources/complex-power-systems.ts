/**
 * Complex Power Systems Resource
 *
 * Advanced power system frameworks for fantasy story generation.
 * Use these templates to create unique, internally consistent magic systems.
 */

// =============================================================================
// CULTIVATION SYSTEMS (Eastern Progression Fantasy)
// =============================================================================

export const CULTIVATION_SYSTEM = {
  name: 'Cultivation System',
  description: 'Progressive spiritual advancement through meditation, combat, and enlightenment',

  realms: [
    {
      tier: 1,
      name: 'Mortal Realm',
      stages: ['Body Tempering', 'Qi Gathering', 'Foundation Establishment'],
      description: 'Building the foundation for cultivation',
      lifespan: '100-150 years',
      abilities: 'Enhanced physical abilities, basic Qi manipulation',
    },
    {
      tier: 2,
      name: 'Earth Realm',
      stages: ['Core Formation', 'Golden Core', 'Nascent Soul'],
      description: 'Forming the spiritual core',
      lifespan: '500-1000 years',
      abilities: 'Flight, elemental manipulation, spiritual sense',
    },
    {
      tier: 3,
      name: 'Heaven Realm',
      stages: ['Soul Transformation', 'Void Refinement', 'Dao Seeking'],
      description: 'Transcending mortal limitations',
      lifespan: '5000-10000 years',
      abilities: 'Domain creation, law manipulation, spatial powers',
    },
    {
      tier: 4,
      name: 'Immortal Realm',
      stages: ['True Immortal', 'Golden Immortal', 'Dao Lord'],
      description: 'Achieving immortality and cosmic power',
      lifespan: 'Eternal',
      abilities: 'Reality manipulation, creating worlds, time control',
    },
    {
      tier: 5,
      name: 'Transcendent Realm',
      stages: ['Ancestral God', 'Supreme Being', 'Source'],
      description: 'Beyond comprehension',
      lifespan: 'Beyond time',
      abilities: 'Omnipotence within domain, creating universes',
    },
  ],

  breakthroughMechanics: {
    tribulations: 'Heavenly lightning trials that test worthiness',
    enlightenment: 'Sudden comprehension of universal laws',
    resources: 'Consuming rare materials, pills, or essence',
    combat: 'Life-death battles that force evolution',
    inheritance: 'Receiving power from predecessors',
  },

  powerTypes: {
    qi: 'Life energy cultivated from the world',
    intent: 'Willpower manifested as pressure or attacks',
    laws: 'Understanding of universal principles (fire, time, space)',
    dao: 'Personal path and philosophical understanding',
    bloodline: 'Inherited power from powerful ancestors',
  },
};

// =============================================================================
// CONCEPTUAL MAGIC (Nen/Stand-Style Personal Powers)
// =============================================================================

export const CONCEPTUAL_MAGIC_SYSTEM = {
  name: 'Conceptual Magic',
  description: 'Unique personal abilities born from soul, trauma, or obsession',

  manifestationTypes: [
    {
      type: 'Embodiment',
      description: 'Physical manifestation that fights alongside user',
      examples: ['Spirit familiar', 'Shadow clone', 'Elemental avatar'],
      limitations: 'Range dependent, shares damage with user',
    },
    {
      type: 'Enhancement',
      description: 'Augments user\'s physical capabilities',
      examples: ['Super strength', 'Perfect aim', 'Accelerated healing'],
      limitations: 'Duration limits, stamina cost',
    },
    {
      type: 'Manipulation',
      description: 'Control over external elements or concepts',
      examples: ['Telekinesis', 'Fire control', 'Probability manipulation'],
      limitations: 'Range/mass limits, concentration required',
    },
    {
      type: 'Transmutation',
      description: 'Changing properties of self or matter',
      examples: ['Body transformation', 'Material conversion', 'State change'],
      limitations: 'Reversion risk, material knowledge required',
    },
    {
      type: 'Emission',
      description: 'Projecting energy or abilities at range',
      examples: ['Energy blasts', 'Teleportation', 'Remote viewing'],
      limitations: 'Power diminishes with distance',
    },
    {
      type: 'Specialization',
      description: 'Unique abilities that defy categorization',
      examples: ['Luck manipulation', 'Contract enforcement', 'Prophecy'],
      limitations: 'Often have severe conditions or costs',
    },
  ],

  conditionSystem: {
    description: 'Abilities grow stronger with self-imposed limitations',
    examples: [
      'Can only use at night → 2x power',
      'Must explain ability to target → Guaranteed hit',
      'Costs 10 years of lifespan → Instant kill potential',
      'Only works on enemies who have harmed innocents → Absolute justice',
    ],
  },

  developmentMethods: {
    trauma: 'Born from intense emotional experiences',
    training: 'Developed through rigorous practice',
    awakening: 'Suddenly manifests at coming of age',
    inheritance: 'Passed down through bloodline',
    contract: 'Granted by external entity',
  },
};

// =============================================================================
// RUNIC/SYMBOLIC MAGIC
// =============================================================================

export const RUNIC_MAGIC_SYSTEM = {
  name: 'Runic Magic',
  description: 'Power through symbols, words, and inscriptions',

  tiers: [
    {
      tier: 1,
      name: 'Mortal Runes',
      description: 'Basic symbols that channel ambient magic',
      effects: 'Simple enchantments, minor protections',
      requirements: 'Basic knowledge, common materials',
    },
    {
      tier: 2,
      name: 'Elder Runes',
      description: 'Ancient symbols with inherent power',
      effects: 'Powerful enchantments, elemental control',
      requirements: 'Rare materials, years of study',
    },
    {
      tier: 3,
      name: 'Divine Script',
      description: 'Language of the gods',
      effects: 'Reality alteration, divine blessings/curses',
      requirements: 'Divine favor, sacred materials',
    },
    {
      tier: 4,
      name: 'First Words',
      description: 'The words that created existence',
      effects: 'Creation and destruction at cosmic scale',
      requirements: 'Forgotten by mortals, forbidden knowledge',
    },
  ],

  applicationMethods: {
    inscription: 'Permanent runes carved into objects',
    gestural: 'Drawing runes in the air with energy',
    verbal: 'Speaking runic words of power',
    mental: 'Visualizing runes for instant casting',
    tattoo: 'Runes permanently inscribed on body',
  },

  runeCategories: {
    elemental: 'Fire, water, earth, air, lightning, ice',
    conceptual: 'Time, space, death, life, fate, truth',
    binding: 'Sealing, contracts, imprisonment',
    enhancement: 'Strengthening, speed, durability',
    protection: 'Barriers, wards, deflection',
    communication: 'Translation, telepathy, summoning',
  },
};

// =============================================================================
// PACT/CONTRACT MAGIC
// =============================================================================

export const CONTRACT_MAGIC_SYSTEM = {
  name: 'Pact Magic',
  description: 'Power gained through binding agreements with entities',

  contractTiers: [
    {
      tier: 1,
      name: 'Spirit Contracts',
      entities: 'Minor spirits, elementals, fae',
      typical_cost: 'Offerings, small favors, energy',
      power_level: 'Minor abilities, information, small services',
    },
    {
      tier: 2,
      name: 'Demon Pacts',
      entities: 'Demons, dark spirits, corrupted beings',
      typical_cost: 'Soul fragments, lifespan, morality',
      power_level: 'Significant combat power, forbidden knowledge',
    },
    {
      tier: 3,
      name: 'Divine Covenants',
      entities: 'Gods, angels, primordial beings',
      typical_cost: 'Devotion, missions, restrictions, transformations',
      power_level: 'Divine abilities, miracles, authority',
    },
    {
      tier: 4,
      name: 'Cosmic Bargains',
      entities: 'Outer gods, fundamental forces, concepts',
      typical_cost: 'Existence alteration, reality anchoring, identity',
      power_level: 'Reality manipulation, conceptual powers',
    },
    {
      tier: 5,
      name: 'Source Agreements',
      entities: 'The system itself, primordial chaos, the void',
      typical_cost: 'Everything and nothing',
      power_level: 'Beyond comprehension',
    },
  ],

  contractElements: {
    invocation: 'How the entity is summoned/contacted',
    offering: 'What is given in the initial contract',
    ongoing_cost: 'Continuous price for maintained power',
    restrictions: 'Limitations on power use',
    termination: 'How the contract can end',
    penalties: 'Consequences for breaking terms',
  },

  commonConditions: [
    'Cannot harm specific type of being',
    'Must perform regular rituals',
    'Power weakens under certain conditions (sunlight, holy ground)',
    'Must spread entity\'s influence',
    'Gradual physical/mental transformation',
    'Cannot refuse summoning calls',
  ],
};

// =============================================================================
// AUTHORITY/DOMAIN SYSTEMS
// =============================================================================

export const AUTHORITY_SYSTEM = {
  name: 'Authority System',
  description: 'Absolute control over specific concepts or territories',

  authorityTypes: [
    {
      type: 'Territorial',
      description: 'Absolute control within a defined space',
      examples: ['Dungeon Core', 'Domain Expansion', 'Reality Marble'],
      mechanics: 'User is omnipotent within domain, but domain has limits',
    },
    {
      type: 'Conceptual',
      description: 'Authority over an abstract concept',
      examples: ['Authority of Death', 'Domain of Fire', 'Aspect of Time'],
      mechanics: 'Can manipulate concept anywhere, but cannot be absolute',
    },
    {
      type: 'Hierarchical',
      description: 'Authority over specific beings or systems',
      examples: ['King of Demons', 'Lord of the Hunt', 'System Administrator'],
      mechanics: 'Absolute command over subjects, limited by hierarchy rules',
    },
  ],

  authorityLevels: [
    { level: 'Fragment', description: 'Partial authority, minor influence' },
    { level: 'Aspect', description: 'Significant authority, major influence' },
    { level: 'Domain', description: 'Near-complete authority, wide influence' },
    { level: 'Absolute', description: 'Complete authority, universal influence' },
  ],

  conflictRules: {
    sameAuthority: 'Higher level wins, equal levels contest with willpower',
    differentAuthority: 'Authorities interact based on conceptual relationship',
    territorial: 'Home domain grants significant advantage',
    multiple: 'Authorities can combine or conflict based on compatibility',
  },
};

// =============================================================================
// MULTI-SYSTEM INTEGRATION
// =============================================================================

export const MULTI_SYSTEM_INTEGRATION = {
  name: 'Multi-System World',
  description: 'Guidelines for worlds with multiple coexisting power systems',

  integrationModels: [
    {
      model: 'Parallel',
      description: 'Systems exist independently, rarely interact',
      example: 'Eastern cultivators and Western mages in separate regions',
      conflict: 'Cultural clashes when systems meet',
    },
    {
      model: 'Hierarchical',
      description: 'One system underlies all others',
      example: 'All magic is actually different expressions of the System',
      conflict: 'Discovering the true nature of power',
    },
    {
      model: 'Competitive',
      description: 'Systems actively oppose each other',
      example: 'Divine power vs. demonic contracts vs. mortal cultivation',
      conflict: 'Power source wars, conversion battles',
    },
    {
      model: 'Synergistic',
      description: 'Systems can be combined for greater power',
      example: 'Runic cultivation, contract-enhanced conceptual magic',
      conflict: 'Finding compatible combinations, hybrid dangers',
    },
  ],

  crossSystemInteractions: {
    cultivation_vs_contracts: 'Cultivators can break free from contracts at high enough realm',
    runic_vs_conceptual: 'Runes can seal or enhance conceptual abilities',
    authority_vs_cultivation: 'Authorities are essentially pinnacle cultivation achievements',
    system_vs_all: 'The System quantifies and regulates all power types',
  },

  hybridPossibilities: [
    'Cultivator who inscribes runes on their golden core',
    'Contract holder who uses pact power to fuel cultivation',
    'Authority holder who grants others conceptual abilities',
    'System user who hacks the interface for custom abilities',
  ],
};

// =============================================================================
// SYSTEM NOTIFICATION TEMPLATES
// =============================================================================

export const SYSTEM_NOTIFICATION_TEMPLATES = {
  levelUp: `
┌─────────────────────────────────────┐
│  ✦ LEVEL UP ✦                       │
│  Level {oldLevel} → Level {newLevel}│
│                                     │
│  +{statPoints} Stat Points Available│
│  +{skillPoints} Skill Points        │
│                                     │
│  New Ability Unlocked:              │
│  ◆ {abilityName}                    │
└─────────────────────────────────────┘`,

  skillAcquired: `
┌─────────────────────────────────────┐
│  ★ NEW SKILL ACQUIRED ★             │
│                                     │
│  {skillName} Lv.1                   │
│  Rank: {rank}                       │
│                                     │
│  {description}                      │
└─────────────────────────────────────┘`,

  breakthroughWarning: `
┌─────────────────────────────────────┐
│  ⚠️ BREAKTHROUGH IMMINENT ⚠️         │
│                                     │
│  Current Realm: {currentRealm}      │
│  Target Realm: {targetRealm}        │
│                                     │
│  Tribulation Incoming...            │
│  Survival Probability: {percent}%   │
│                                     │
│  ⚡ PREPARE YOURSELF ⚡              │
└─────────────────────────────────────┘`,

  questUpdate: `
┌─────────────────────────────────────┐
│  📜 QUEST UPDATE                    │
│                                     │
│  {questName}                        │
│  Progress: {current}/{total}        │
│                                     │
│  {updateDescription}                │
│                                     │
│  Rewards: {rewards}                 │
└─────────────────────────────────────┘`,

  bossEncounter: `
┌─────────────────────────────────────┐
│  ☠️ BOSS ENCOUNTERED ☠️              │
│                                     │
│  {bossName}                         │
│  Level: {level}                     │
│  Threat: {threatLevel}              │
│                                     │
│  Special Abilities:                 │
│  • {ability1}                       │
│  • {ability2}                       │
│                                     │
│  Recommended Party Level: {recLevel}│
└─────────────────────────────────────┘`,

  lootDropped: `
┌─────────────────────────────────────┐
│  💎 LOOT ACQUIRED                   │
│                                     │
│  {itemName}                         │
│  Rarity: {rarity}                   │
│  Type: {type}                       │
│                                     │
│  Effects:                           │
│  {effects}                          │
│                                     │
│  Value: {value} gold                │
└─────────────────────────────────────┘`,

  divineNotice: `
┌─────────────────────────────────────┐
│  👁️ DIVINE ATTENTION                │
│                                     │
│  {deityName} has noticed you.       │
│                                     │
│  {message}                          │
│                                     │
│  Favor: {favorStatus}               │
└─────────────────────────────────────┘`,

  warning: `
┌─────────────────────────────────────┐
│  ⚠️ WARNING                         │
│  {warningType}                      │
│                                     │
│  {description}                      │
│                                     │
│  Recommendation: {recommendation}   │
└─────────────────────────────────────┘`,
};

// =============================================================================
// POWER LEVEL COMPARISON CHART
// =============================================================================

export const POWER_LEVEL_CHART = {
  description: 'Cross-system power level equivalencies',
  levels: [
    {
      tier: 'F',
      cultivation: 'Body Tempering',
      conceptual: 'Latent',
      runic: 'Apprentice',
      contract: 'None',
      authority: 'None',
      description: 'Average human',
    },
    {
      tier: 'E',
      cultivation: 'Qi Gathering',
      conceptual: 'Awakened',
      runic: 'Journeyman',
      contract: 'Minor Spirit',
      authority: 'None',
      description: 'Enhanced human',
    },
    {
      tier: 'D',
      cultivation: 'Foundation',
      conceptual: 'Developed',
      runic: 'Adept',
      contract: 'Spirit Pact',
      authority: 'Fragment',
      description: 'Local threat',
    },
    {
      tier: 'C',
      cultivation: 'Core Formation',
      conceptual: 'Mastered',
      runic: 'Expert',
      contract: 'Demon Pact',
      authority: 'Fragment+',
      description: 'Regional threat',
    },
    {
      tier: 'B',
      cultivation: 'Nascent Soul',
      conceptual: 'Transcendent',
      runic: 'Master',
      contract: 'Greater Demon',
      authority: 'Aspect',
      description: 'Continental threat',
    },
    {
      tier: 'A',
      cultivation: 'Soul Transformation',
      conceptual: 'Legendary',
      runic: 'Grandmaster',
      contract: 'Divine Covenant',
      authority: 'Domain',
      description: 'World threat',
    },
    {
      tier: 'S',
      cultivation: 'Dao Seeking',
      conceptual: 'Mythic',
      runic: 'Divine Script',
      contract: 'Cosmic Bargain',
      authority: 'Domain+',
      description: 'Planar threat',
    },
    {
      tier: 'SS',
      cultivation: 'True Immortal',
      conceptual: 'Absolute',
      runic: 'First Word',
      contract: 'Source Agreement',
      authority: 'Absolute',
      description: 'Universal threat',
    },
    {
      tier: 'SSS',
      cultivation: 'Dao Lord+',
      conceptual: 'Beyond',
      runic: 'Creator',
      contract: 'Beyond Contract',
      authority: 'Supreme',
      description: 'Multiversal threat',
    },
  ],
};
