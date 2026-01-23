import { run, network } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const deploymentFile = path.join(__dirname, `../deployments/${network.name}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`No deployment found for network: ${network.name}`);
    console.error(`Expected file: ${deploymentFile}`);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf-8'));

  console.log('Verifying contracts on:', network.name);
  console.log('Deployment:', deployment);

  // 1. Verify Treasury
  console.log('\n--- Verifying Treasury ---');
  try {
    await run('verify:verify', {
      address: deployment.treasury,
      constructorArguments: [],
    });
    console.log('Treasury verified!');
  } catch (error: any) {
    if (error.message.includes('Already Verified')) {
      console.log('Treasury already verified');
    } else {
      console.error('Failed to verify Treasury:', error.message);
    }
  }

  // 2. Verify NFT
  console.log('\n--- Verifying StoryForgeNFT ---');
  try {
    await run('verify:verify', {
      address: deployment.nft,
      constructorArguments: [],
    });
    console.log('StoryForgeNFT verified!');
  } catch (error: any) {
    if (error.message.includes('Already Verified')) {
      console.log('StoryForgeNFT already verified');
    } else {
      console.error('Failed to verify StoryForgeNFT:', error.message);
    }
  }

  // 3. Verify BettingPool Implementation
  console.log('\n--- Verifying StoryForgeBettingPool Implementation ---');
  try {
    await run('verify:verify', {
      address: deployment.bettingPoolImpl,
      constructorArguments: [],
    });
    console.log('StoryForgeBettingPool Implementation verified!');
  } catch (error: any) {
    if (error.message.includes('Already Verified')) {
      console.log('StoryForgeBettingPool Implementation already verified');
    } else {
      console.error('Failed to verify BettingPool Implementation:', error.message);
    }
  }

  console.log('\n--- Verification Complete! ---');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
