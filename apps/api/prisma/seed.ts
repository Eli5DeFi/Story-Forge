import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a sample fantasy story
  const story = await prisma.story.upsert({
    where: { slug: 'chronicles-of-eldoria' },
    update: {},
    create: {
      title: 'The Chronicles of Eldoria',
      slug: 'chronicles-of-eldoria',
      synopsis: `In a world where magic flows through ancient ley lines and dragons still roam the skies, a young mage named Aria discovers she possesses a forbidden power—the ability to see the threads of fate itself. When the Cipher Stone, an artifact capable of rewriting destiny, is stolen by the shadowy Obsidian Court, Aria must journey across the fractured kingdoms of Eldoria to recover it before reality itself unravels.

Along the way, she'll forge unlikely alliances, face ancient evils, and discover that the greatest threat to Eldoria may not be the Obsidian Court—but the secrets hidden in her own bloodline.`,
      genre: 'Epic Fantasy',
      status: 'ACTIVE',
      currentChapter: 1,
      coverImageUrl: 'https://placehold.co/800x1200/1a1a2e/eee?text=Chronicles+of+Eldoria',
      styleGuide: `Writing Style Guidelines:
- Rich, sensory descriptions that bring Eldoria to life
- Complex characters with distinct voices and motivations
- Balance epic scope with intimate character moments
- Magic system: Ley lines, runes, blood magic (forbidden), elemental affinities
- Tone: Dark fantasy with moments of hope and humor
- POV: Third person limited, primarily following Aria
- Chapter length: 2500-3500 words
- End chapters on compelling cliffhangers or revelations`,
      worldState: {
        currentTime: 'Day 1, Dusk',
        currentLocation: 'The Shattered Isles',
        activeQuests: [
          {
            id: 'recover-cipher-stone',
            name: 'The Stolen Destiny',
            description: 'Recover the Cipher Stone from the Obsidian Court',
            status: 'active',
            objectives: [
              'Learn the location of the Obsidian Court\'s stronghold',
              'Gather allies for the journey',
              'Recover the Cipher Stone'
            ],
            completedObjectives: []
          }
        ],
        globalEvents: [
          {
            name: 'The Theft of the Cipher Stone',
            description: 'The Obsidian Court has stolen the Cipher Stone from the Sanctum of Threads',
            chapter: 1,
            ongoing: true
          }
        ],
        factions: [
          {
            name: 'The Sanctum of Threads',
            disposition: 'friendly',
            power: 6,
            recentActions: ['Lost the Cipher Stone to theft']
          },
          {
            name: 'The Obsidian Court',
            disposition: 'hostile',
            power: 8,
            recentActions: ['Stole the Cipher Stone', 'Began gathering shadow essence']
          },
          {
            name: 'The Dragon Conclave',
            disposition: 'neutral',
            power: 9,
            recentActions: ['Withdrew to the Spine Mountains']
          }
        ],
        magicSystemState: {
          currentManaLevel: 'unstable',
          activeEnchantments: ['Ward of Seeking (on Aria)'],
          magicalAnomalies: ['Ley line fluctuations near the Shattered Isles']
        }
      },
      plotThreads: [
        {
          id: 'main-quest',
          name: 'The Cipher Stone',
          description: 'Recover the Cipher Stone before the Obsidian Court uses it to rewrite reality',
          status: 'developing',
          priority: 'main',
          involvedCharacters: ['Aria', 'The Shadow Sovereign'],
          chapters: [1],
          foreshadowing: ['Aria\'s visions of possible futures', 'The significance of her bloodline'],
          payoffs: []
        },
        {
          id: 'aria-bloodline',
          name: 'Secrets of the Bloodline',
          description: 'The mystery of Aria\'s forbidden power and her family history',
          status: 'setup',
          priority: 'secondary',
          involvedCharacters: ['Aria'],
          chapters: [1],
          foreshadowing: ['Aria can see fate threads', 'Her mother\'s mysterious disappearance'],
          payoffs: []
        }
      ]
    },
  });

  console.log(`Created story: ${story.title}`);

  // Create initial chapter
  const chapter = await prisma.chapter.upsert({
    where: {
      storyId_chapterNumber: {
        storyId: story.id,
        chapterNumber: 1,
      },
    },
    update: {},
    create: {
      storyId: story.id,
      chapterNumber: 1,
      title: 'The Unraveling Thread',
      content: `The Sanctum of Threads hung suspended between two ley lines, its crystalline spires catching the dying light of the twin suns. Aria pressed her palm against the cold observation window, watching the threads of fate dance and weave through the air outside—visible only to her cursed eyes.

"You're brooding again," said Master Venn, his footsteps echoing across the marble floor behind her. The old sage's robes whispered against the stone, embroidered with runes that had long since faded from overuse.

"The threads are... wrong." Aria didn't turn from the window. "They've been twisting all day. Something's coming."

Master Venn joined her at the window, though she knew he could see nothing but the sunset. "Your sight grows stronger each day. The Council is concerned—"

"The Council can—" She bit off the words. Disrespecting the Council of Weavers was grounds for expulsion, and the Sanctum was the only home she'd ever known. The only place that hadn't tried to burn her for what she could see.

A tremor ran through the floor.

Aria spun, her hand instinctively reaching for the dagger at her hip. The threads around her blazed crimson—a color she'd only seen in her nightmares.

"The Cipher Stone," Master Venn breathed, his face draining of color. "They've breached the vault."

They ran.

The corridors of the Sanctum, usually serene and filled with the soft murmur of scholarly debate, erupted into chaos. Scribes fled past them, their white robes billowing. A young apprentice crashed into Aria, nearly sending her sprawling.

"Shadows!" he screamed, his eyes wild. "Shadows that move like men!"

Aria grabbed his collar. "Where? Which way?"

He pointed with a shaking hand toward the lower levels—toward the Vault of Threads, where the most dangerous artifacts in existence were kept. Where the Cipher Stone, the artifact capable of rewriting the very fabric of destiny, had been guarded for three thousand years.

She released him and ran faster.

The vault doors had been torn from their hinges—not broken, not melted, but unmade. Where ancient dragonforged steel should have stood, there was only a shimmering absence, as if reality itself had forgotten the doors existed.

Inside, darkness coiled like a living thing.

"Aria, wait—" Master Venn's warning came too late.

She stepped through the threshold, and the darkness turned to look at her.

Not with eyes—with something worse. With awareness. The shadows peeled back like a blooming flower of night, revealing a figure at their center. Tall, impossibly still, wrapped in a cloak that seemed to be made of captured starlight turned rancid.

The Shadow Sovereign.

"Ah," said a voice that came from everywhere and nowhere. "A Threadseer. How... unexpected."

Aria's hand found her dagger, though she knew it would be useless. "Put it back. The Cipher Stone isn't meant to be wielded."

"Isn't it?" The Sovereign tilted their head, and Aria caught a glimpse of something beneath the hood—not a face, but an absence where a face should be. "And yet someone created it. Someone meant for it to be used."

The threads around the Sovereign writhed in patterns Aria had never seen—futures branching and dying, possibilities being snuffed out one by one.

"What are you doing?"

"Editing." The word dripped with satisfaction. "The Stone shows me all the paths destiny might take. And I am selecting... only the ones that serve my purpose."

A tendril of shadow lashed out, wrapping around Master Venn's throat. The old man gasped, his hands clawing uselessly at darkness that wasn't really there.

"No!" Aria lunged forward, but more shadows pinned her arms, her legs, her breath.

"You have a choice, Threadseer." The Sovereign drifted closer, and Aria felt her future—her entire existence—narrowing to a single point. "Join me, and I will show you how to master your sight. How to not merely see fate, but to shape it."

"Go to the Void."

"Disappointing, but not unexpected." The Sovereign gestured, and the remaining shadows began to pour toward the vault's rear wall—toward a portal that hadn't been there a moment ago. "You have one week, Threadseer. One week before I use the Stone to unmake the world as you know it. Try to stop me... if you can."

The shadows vanished. Master Venn crumpled to the ground, gasping. And in the center of the vault, where the Cipher Stone had rested for three millennia, there was only empty air.

Aria stood in the darkness, watching the threads of her own fate multiply into an infinity of paths—most of them ending in death.

She'd always wanted to know her purpose. Now she did.

She had one week to save the world.`,
      summary: 'Aria, a young Threadseer at the Sanctum, witnesses the theft of the Cipher Stone by the Shadow Sovereign. After a confrontation where the Sovereign offers her a dark bargain, Aria is given one week to stop them before they use the Stone to unmake reality.',
      status: 'BETTING_OPEN',
      publishedAt: new Date(),
      bettingEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      extractedEntities: {
        characters: ['Aria', 'Master Venn', 'The Shadow Sovereign'],
        locations: ['The Sanctum of Threads', 'Vault of Threads'],
        items: ['The Cipher Stone'],
        monsters: []
      }
    },
  });

  console.log(`Created chapter: ${chapter.title}`);

  // Create outcomes for betting
  const outcomes = [
    {
      teaserText: 'Aria decides to pursue the Shadow Sovereign alone, trusting no one but herself with the fate of Eldoria.',
      emotionalTone: 'determined',
      plotImplications: ['Solo journey begins', 'Aria develops self-reliance', 'Potential isolation arc']
    },
    {
      teaserText: 'Master Venn reveals a secret society of mages who have been preparing for this day—and Aria must decide whether to trust them.',
      emotionalTone: 'mysterious',
      plotImplications: ['New faction introduced', 'Trust themes explored', 'Allies gathered']
    },
    {
      teaserText: 'A dragon appears with an offer: ancient knowledge of the Cipher Stone in exchange for a dangerous favor.',
      emotionalTone: 'ominous',
      plotImplications: ['Dragon Conclave involvement', 'Faustian bargain potential', 'Dragon lore expanded']
    },
    {
      teaserText: 'Aria\'s mother—long thought dead—sends a message through the threads of fate, revealing she\'s still alive.',
      emotionalTone: 'hopeful',
      plotImplications: ['Family mystery deepens', 'New quest objective', 'Emotional stakes raised']
    },
    {
      teaserText: 'The Shadow Sovereign\'s first act with the Stone causes reality to crack, creating a tear in the world that must be sealed immediately.',
      emotionalTone: 'urgent',
      plotImplications: ['Immediate crisis', 'World-building through catastrophe', 'Timeline pressure']
    }
  ];

  for (let i = 0; i < outcomes.length; i++) {
    const outcome = await prisma.outcome.upsert({
      where: {
        chapterId_optionNumber: {
          chapterId: chapter.id,
          optionNumber: i + 1,
        },
      },
      update: {},
      create: {
        chapterId: chapter.id,
        optionNumber: i + 1,
        teaserText: outcomes[i].teaserText,
        emotionalTone: outcomes[i].emotionalTone,
        plotImplications: outcomes[i].plotImplications,
      },
    });

    // Create betting pool for each outcome
    await prisma.bettingPool.upsert({
      where: { outcomeId: outcome.id },
      update: {},
      create: {
        chapterId: chapter.id,
        outcomeId: outcome.id,
        status: 'OPEN',
      },
    });

    console.log(`Created outcome ${i + 1}: ${outcomes[i].teaserText.substring(0, 50)}...`);
  }

  // Create initial characters
  const characters = [
    {
      name: 'Aria',
      description: 'A young Threadseer with the forbidden ability to see the threads of fate. Raised at the Sanctum of Threads after being abandoned as an infant, she has always felt like an outsider despite her rare gift. Her power grows stronger each day, and with it, her glimpses of possible futures—most of them ending in darkness.',
      shortBio: 'A Threadseer burdened with forbidden sight',
      traits: {
        personality: ['determined', 'curious', 'guarded', 'compassionate'],
        abilities: ['fate-sight', 'thread-reading', 'dagger combat']
      },
      status: 'alive'
    },
    {
      name: 'Master Venn',
      description: 'An elderly sage and one of the few remaining master weavers at the Sanctum. He took Aria under his wing when she was young, teaching her to control her visions. Despite his kind demeanor, he carries secrets about Aria\'s past that he has sworn never to reveal.',
      shortBio: 'Ancient sage with hidden knowledge',
      traits: {
        personality: ['wise', 'secretive', 'protective', 'patient'],
        abilities: ['ley-line manipulation', 'warding magic', 'historical knowledge']
      },
      status: 'alive'
    },
    {
      name: 'The Shadow Sovereign',
      description: 'A mysterious figure who leads the Obsidian Court. Their true identity is unknown—some say they were once a powerful mage who gazed too deep into the void. They seek the Cipher Stone to "edit" reality itself, culling the timelines they deem unworthy.',
      shortBio: 'Ruler of shadows who seeks to rewrite destiny',
      traits: {
        personality: ['calculating', 'patient', 'ruthless', 'philosophical'],
        abilities: ['shadow manipulation', 'reality editing', 'fate corruption']
      },
      status: 'alive'
    }
  ];

  for (const char of characters) {
    await prisma.character.upsert({
      where: {
        storyId_name: {
          storyId: story.id,
          name: char.name,
        },
      },
      update: {},
      create: {
        storyId: story.id,
        name: char.name,
        description: char.description,
        shortBio: char.shortBio,
        traits: char.traits,
        status: char.status,
        firstAppearance: 1,
      },
    });
    console.log(`Created character: ${char.name}`);
  }

  // Create initial locations
  const locations = [
    {
      name: 'The Sanctum of Threads',
      description: 'A floating citadel suspended between two major ley lines, serving as both library and fortress for the Council of Weavers. Its crystalline spires are said to be grown from solidified magic, and its halls contain knowledge spanning three thousand years.',
      type: 'stronghold'
    },
    {
      name: 'Vault of Threads',
      description: 'The most secure chamber in the Sanctum, protected by countless wards and dragonforged doors. It housed the most dangerous artifacts known to exist, including the Cipher Stone—until its theft.',
      type: 'vault'
    }
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: {
        storyId_name: {
          storyId: story.id,
          name: loc.name,
        },
      },
      update: {},
      create: {
        storyId: story.id,
        name: loc.name,
        description: loc.description,
        type: loc.type,
        firstAppearance: 1,
      },
    });
    console.log(`Created location: ${loc.name}`);
  }

  // Create the Cipher Stone
  await prisma.item.upsert({
    where: {
      storyId_name: {
        storyId: story.id,
        name: 'The Cipher Stone',
      },
    },
    update: {},
    create: {
      storyId: story.id,
      name: 'The Cipher Stone',
      description: 'An artifact of immense power, capable of revealing all possible futures and allowing its wielder to "edit" reality by selecting which timelines are allowed to exist. Created in the Age of Dragons by unknown hands.',
      type: 'ARTIFACT',
      rarity: 'MYTHIC',
      firstAppearance: 1,
      currentOwner: 'The Shadow Sovereign',
    },
  });
  console.log('Created item: The Cipher Stone');

  console.log('');
  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log(`Story ID: ${story.id}`);
  console.log(`Chapter ID: ${chapter.id}`);
  console.log('');
  console.log('You can now test the AI pipeline with:');
  console.log(`  POST /api/admin/stories/${story.id}/generate`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
