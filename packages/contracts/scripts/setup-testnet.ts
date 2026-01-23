import { ethers, network } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Setup script for testnet deployments
 * - Creates initial betting pool for testing
 * - Mints test NFTs
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Setting up testnet with account:', deployer.address);
  console.log('Network:', network.name);

  // Load deployment addresses
  const deploymentFile = path.join(__dirname, `../deployments/${network.name}.json`);
  if (!fs.existsSync(deploymentFile)) {
    console.error(`No deployment found for network: ${network.name}`);
    console.error('Run deploy script first: npm run deploy:sepolia');
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf-8'));

  // Get contract instances
  const bettingPool = await ethers.getContractAt('StoryForgeBettingPool', deployment.bettingPool);
  const nft = await ethers.getContractAt('StoryForgeNFT', deployment.nft);

  console.log('\n--- Creating Test Betting Pool ---');

  // Create a test pool (chapter 1, 3 days duration)
  const chapterId = 1;
  const bettingDuration = 3 * 24 * 60 * 60; // 3 days in seconds

  try {
    const tx = await bettingPool.createPool(
      chapterId,
      bettingDuration,
      deployment.usdc,
      0, // no carryover
    );
    const receipt = await tx.wait();
    console.log('Test pool created! Tx:', receipt?.hash);

    // Get pool info
    const poolId = await bettingPool.poolCounter();
    console.log('Pool ID:', poolId.toString());

    const poolInfo = await bettingPool.getPoolInfo(poolId);
    console.log('Pool Info:', {
      chapterId: poolInfo[0].toString(),
      totalDeposits: poolInfo[1].toString(),
      bettingEndsAt: new Date(Number(poolInfo[3]) * 1000).toISOString(),
      isResolved: poolInfo[5],
    });
  } catch (error: any) {
    console.error('Failed to create test pool:', error.message);
  }

  console.log('\n--- Minting Test NFTs ---');

  // Mint some test entities
  const testEntities = [
    {
      type: 0, // CHARACTER
      storyId: 'test-story-1',
      name: 'Aria Shadowmend',
      chapter: 1,
      uri: 'ipfs://QmTest123/aria.json',
    },
    {
      type: 3, // MONSTER
      storyId: 'test-story-1',
      name: 'Ancient Dragon of Aethermoor',
      chapter: 1,
      uri: 'ipfs://QmTest123/dragon.json',
    },
    {
      type: 1, // ITEM
      storyId: 'test-story-1',
      name: 'Cipher Stone',
      chapter: 1,
      uri: 'ipfs://QmTest123/cipher-stone.json',
    },
  ];

  for (const entity of testEntities) {
    try {
      // Check if already minted
      const isMinted = await nft.isEntityMinted(entity.storyId, entity.name);
      if (isMinted) {
        console.log(`Entity "${entity.name}" already minted, skipping...`);
        continue;
      }

      const tx = await nft.mintEntity(
        deployer.address,
        entity.type,
        entity.storyId,
        entity.name,
        entity.chapter,
        entity.uri,
      );
      const receipt = await tx.wait();
      console.log(`Minted "${entity.name}" - Tx: ${receipt?.hash}`);

      const tokenId = await nft.getEntityTokenId(entity.storyId, entity.name);
      console.log(`Token ID: ${tokenId.toString()}`);
    } catch (error: any) {
      console.error(`Failed to mint "${entity.name}":`, error.message);
    }
  }

  // Get final stats
  console.log('\n--- Final Stats ---');
  const totalMinted = await nft.totalMinted();
  console.log('Total NFTs Minted:', totalMinted.toString());

  const storyCounts = await nft.getStoryEntityCounts('test-story-1');
  console.log('Story Entity Counts:', {
    characters: storyCounts[0].toString(),
    items: storyCounts[1].toString(),
    locations: storyCounts[2].toString(),
    monsters: storyCounts[3].toString(),
  });

  console.log('\n--- Setup Complete! ---');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
