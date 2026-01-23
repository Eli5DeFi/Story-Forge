import { ethers, upgrades } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', (await ethers.provider.getBalance(deployer.address)).toString());

  // Get network config
  const network = await ethers.provider.getNetwork();
  console.log('Deploying to network:', network.name, 'chainId:', network.chainId);

  // Token addresses (update for each network)
  const tokenAddresses: Record<string, { usdc: string; usdt: string }> = {
    // Base Mainnet
    '8453': {
      usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      usdt: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    },
    // Base Sepolia
    '84532': {
      usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Test USDC
      usdt: '0x0000000000000000000000000000000000000000', // No test USDT
    },
    // Polygon Mainnet
    '137': {
      usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      usdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    },
    // Local/Hardhat
    '31337': {
      usdc: '0x0000000000000000000000000000000000000000',
      usdt: '0x0000000000000000000000000000000000000000',
    },
  };

  const chainId = network.chainId.toString();
  const tokens = tokenAddresses[chainId] || tokenAddresses['31337'];

  console.log('Using token addresses:', tokens);

  // 1. Deploy Treasury
  console.log('\n1. Deploying Treasury...');
  const Treasury = await ethers.getContractFactory('Treasury');
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log('Treasury deployed to:', treasuryAddress);

  // 2. Deploy StoryForgeNFT
  console.log('\n2. Deploying StoryForgeNFT...');
  const StoryForgeNFT = await ethers.getContractFactory('StoryForgeNFT');
  const nft = await StoryForgeNFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log('StoryForgeNFT deployed to:', nftAddress);

  // 3. Deploy BettingPool (Upgradeable)
  console.log('\n3. Deploying StoryForgeBettingPool (upgradeable)...');
  const StoryForgeBettingPool = await ethers.getContractFactory('StoryForgeBettingPool');
  const bettingPool = await upgrades.deployProxy(
    StoryForgeBettingPool,
    [
      treasuryAddress,
      deployer.address, // Oracle (deployer for now, update later)
      tokens.usdc,
      tokens.usdt,
    ],
    { kind: 'uups' }
  );
  await bettingPool.waitForDeployment();
  const bettingPoolAddress = await bettingPool.getAddress();
  console.log('StoryForgeBettingPool deployed to:', bettingPoolAddress);

  // Print summary
  console.log('\n========================================');
  console.log('DEPLOYMENT SUMMARY');
  console.log('========================================');
  console.log('Network:', network.name, `(${chainId})`);
  console.log('Deployer:', deployer.address);
  console.log('----------------------------------------');
  console.log('Treasury:', treasuryAddress);
  console.log('StoryForgeNFT:', nftAddress);
  console.log('StoryForgeBettingPool:', bettingPoolAddress);
  console.log('----------------------------------------');
  console.log('USDC:', tokens.usdc);
  console.log('USDT:', tokens.usdt);
  console.log('========================================');

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      Treasury: treasuryAddress,
      StoryForgeNFT: nftAddress,
      StoryForgeBettingPool: bettingPoolAddress,
    },
    tokens: tokens,
  };

  console.log('\nDeployment info:', JSON.stringify(deploymentInfo, null, 2));

  // Verify contracts if not on local network
  if (chainId !== '31337') {
    console.log('\nWaiting for block confirmations before verification...');
    await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30 seconds

    console.log('\nVerifying contracts...');
    try {
      // Verify Treasury
      await run('verify:verify', {
        address: treasuryAddress,
        constructorArguments: [],
      });
      console.log('Treasury verified');
    } catch (e) {
      console.log('Treasury verification failed:', e);
    }

    try {
      // Verify NFT
      await run('verify:verify', {
        address: nftAddress,
        constructorArguments: [],
      });
      console.log('StoryForgeNFT verified');
    } catch (e) {
      console.log('StoryForgeNFT verification failed:', e);
    }

    // Note: Proxy contracts need different verification approach
    console.log('Note: BettingPool proxy verification requires manual verification');
  }

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
