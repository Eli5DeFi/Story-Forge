'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon,
  GlobeAltIcon,
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

interface Chain {
  chainId: number;
  name: string;
  shortName: string;
  logo: string;
  currency: {
    name: string;
    symbol: string;
  };
  features: {
    isActive: boolean;
    isLaunched: boolean;
    estimatedTPS: number;
    avgBlockTime: number;
    highThroughput?: boolean;
    interoperable?: boolean;
    primaryChain?: boolean;
  };
  contracts: {
    storyToken: string | null;
    bettingPool: string | null;
    nftCollection: string | null;
  };
}

interface MultiChainSelectorProps {
  onChainChange: (chain: Chain) => void;
  currentChain: Chain;
  showBridge?: boolean;
}

const SUPPORTED_CHAINS: Chain[] = [
  {
    chainId: 8453,
    name: "Base",
    shortName: "base",
    logo: "🔵",
    currency: { name: "Ether", symbol: "ETH" },
    features: {
      isActive: true,
      isLaunched: true,
      primaryChain: true,
      estimatedTPS: 2000,
      avgBlockTime: 2,
    },
    contracts: {
      storyToken: "0x1234...", // Placeholder
      bettingPool: "0x5678...",
      nftCollection: "0x9abc...",
    }
  },
  {
    chainId: 42161,
    name: "Arbitrum One",
    shortName: "arbitrum", 
    logo: "🔷",
    currency: { name: "Ether", symbol: "ETH" },
    features: {
      isActive: true,
      isLaunched: true,
      estimatedTPS: 4000,
      avgBlockTime: 1,
    },
    contracts: {
      storyToken: "0xdef0...", // Placeholder
      bettingPool: "0x1234...",
      nftCollection: "0x5678...",
    }
  },
  {
    chainId: 10,
    name: "Optimism",
    shortName: "optimism",
    logo: "🔴",
    currency: { name: "Ether", symbol: "ETH" },
    features: {
      isActive: true,
      isLaunched: true,
      estimatedTPS: 2000,
      avgBlockTime: 2,
    },
    contracts: {
      storyToken: "0x9abc...", // Placeholder
      bettingPool: "0xdef0...",
      nftCollection: "0x1234...",
    }
  },
  {
    chainId: 424242,
    name: "MegaETH",
    shortName: "megaeth",
    logo: "⚡",
    currency: { name: "Ether", symbol: "ETH" },
    features: {
      isActive: false,
      isLaunched: false,
      highThroughput: true,
      estimatedTPS: 100000,
      avgBlockTime: 1,
    },
    contracts: {
      storyToken: null,
      bettingPool: null,
      nftCollection: null,
    }
  },
  {
    chainId: 555555,
    name: "HyperEVM", 
    shortName: "hyperevm",
    logo: "🌐",
    currency: { name: "Ether", symbol: "ETH" },
    features: {
      isActive: false,
      isLaunched: false,
      interoperable: true,
      estimatedTPS: 10000,
      avgBlockTime: 2,
    },
    contracts: {
      storyToken: null,
      bettingPool: null,
      nftCollection: null,
    }
  }
];

export default function MultiChainSelector({ 
  onChainChange, 
  currentChain, 
  showBridge = true 
}: MultiChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showBridgeModal, setShowBridgeModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleChainSwitch = async (chain: Chain) => {
    if (!chain.features.isActive) {
      alert(`${chain.name} is not yet available. Coming soon!`);
      return;
    }

    setIsConnecting(true);
    setIsOpen(false);
    
    try {
      // In a real app, this would trigger wallet chain switching
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      onChainChange(chain);
    } catch (error) {
      console.error('Error switching chains:', error);
      alert('Failed to switch chains. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const getChainStatus = (chain: Chain) => {
    if (!chain.features.isLaunched) {
      return { status: 'coming-soon', icon: ClockIcon, color: 'text-yellow-500' };
    }
    if (!chain.features.isActive) {
      return { status: 'inactive', icon: ExclamationTriangleIcon, color: 'text-red-500' };
    }
    return { status: 'active', icon: CheckCircleIcon, color: 'text-green-500' };
  };

  const getPerformanceBadge = (chain: Chain) => {
    if (chain.features.highThroughput) {
      return { text: 'Ultra Fast', color: 'bg-purple-100 text-purple-800' };
    }
    if (chain.features.estimatedTPS > 3000) {
      return { text: 'High Speed', color: 'bg-blue-100 text-blue-800' };
    }
    if (chain.features.interoperable) {
      return { text: 'Interoperable', color: 'bg-green-100 text-green-800' };
    }
    if (chain.features.primaryChain) {
      return { text: 'Primary', color: 'bg-indigo-100 text-indigo-800' };
    }
    return { text: 'Standard', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <>
      <div className="relative">
        {/* Main Chain Selector */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isConnecting}
          className={`flex items-center space-x-3 px-4 py-2 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all ${
            isConnecting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{currentChain.logo}</span>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">
                {currentChain.name}
              </div>
              {isConnecting && (
                <div className="text-xs text-gray-500">Connecting...</div>
              )}
            </div>
          </div>
          <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </button>

        {/* Chain Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
            >
              <div className="p-3">
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Select Network
                </div>
                
                <div className="space-y-2">
                  {SUPPORTED_CHAINS.map((chain) => {
                    const status = getChainStatus(chain);
                    const badge = getPerformanceBadge(chain);
                    const StatusIcon = status.icon;
                    
                    return (
                      <button
                        key={chain.chainId}
                        onClick={() => handleChainSwitch(chain)}
                        disabled={!chain.features.isActive}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                          currentChain.chainId === chain.chainId
                            ? 'border-indigo-200 bg-indigo-50'
                            : chain.features.isActive
                            ? 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{chain.logo}</span>
                          <div className="text-left">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {chain.name}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                                {badge.text}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {chain.features.estimatedTPS.toLocaleString()} TPS • {chain.features.avgBlockTime}s blocks
                            </div>
                          </div>
                        </div>
                        
                        <StatusIcon className={`h-4 w-4 ${status.color}`} />
                      </button>
                    );
                  })}
                </div>

                {showBridge && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setShowBridgeModal(true);
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
                    >
                      <ArrowsRightLeftIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Bridge Tokens</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bridge Modal */}
      <AnimatePresence>
        {showBridgeModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={() => setShowBridgeModal(false)}
            />
            
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              >
                <BridgeInterface 
                  currentChain={currentChain}
                  onClose={() => setShowBridgeModal(false)}
                />
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

interface BridgeInterfaceProps {
  currentChain: Chain;
  onClose: () => void;
}

function BridgeInterface({ currentChain, onClose }: BridgeInterfaceProps) {
  const [fromChain, setFromChain] = useState(currentChain);
  const [toChain, setToChain] = useState(SUPPORTED_CHAINS.find(c => c.chainId !== currentChain.chainId && c.features.isActive) || SUPPORTED_CHAINS[0]);
  const [amount, setAmount] = useState('');
  const [isBridging, setIsBridging] = useState(false);

  const activeChains = SUPPORTED_CHAINS.filter(chain => chain.features.isActive);
  const estimatedTime = getEstimatedBridgeTime(fromChain, toChain);
  const bridgeFee = calculateBridgeFee(amount);

  const handleBridge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsBridging(true);
    
    try {
      // In a real app, this would call the bridge contract
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate bridge
      alert(`Successfully initiated bridge of ${amount} STORY from ${fromChain.name} to ${toChain.name}`);
      onClose();
    } catch (error) {
      console.error('Bridge error:', error);
      alert('Bridge failed. Please try again.');
    } finally {
      setIsBridging(false);
    }
  };

  const swapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Bridge $STORY Tokens</h3>
        <p className="text-sm text-gray-600 mt-1">
          Transfer tokens between networks
        </p>
      </div>

      {/* Chain Selection */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">From</label>
          <select
            value={fromChain.chainId}
            onChange={(e) => setFromChain(activeChains.find(c => c.chainId === parseInt(e.target.value))!)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {activeChains.map(chain => (
              <option key={chain.chainId} value={chain.chainId}>
                {chain.logo} {chain.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center">
          <button
            onClick={swapChains}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowsRightLeftIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">To</label>
          <select
            value={toChain.chainId}
            onChange={(e) => setToChain(activeChains.find(c => c.chainId === parseInt(e.target.value))!)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {activeChains.filter(c => c.chainId !== fromChain.chainId).map(chain => (
              <option key={chain.chainId} value={chain.chainId}>
                {chain.logo} {chain.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Amount</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full p-3 pr-16 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="absolute right-3 top-3 text-sm text-gray-500">
            STORY
          </div>
        </div>
      </div>

      {/* Bridge Info */}
      {amount && parseFloat(amount) > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Bridge Fee (0.5%)</span>
            <span className="text-gray-900">{bridgeFee} STORY</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">You'll receive</span>
            <span className="text-gray-900 font-medium">
              {(parseFloat(amount) - bridgeFee).toFixed(4)} STORY
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated time</span>
            <span className="text-gray-900">{estimatedTime}</span>
          </div>
        </div>
      )}

      {/* Bridge Button */}
      <div className="space-y-3">
        <button
          onClick={handleBridge}
          disabled={!amount || parseFloat(amount) <= 0 || isBridging}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            !amount || parseFloat(amount) <= 0 || isBridging
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
          }`}
        >
          {isBridging ? 'Bridging...' : `Bridge to ${toChain.name}`}
        </button>
        
        <button
          onClick={onClose}
          className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Helper functions
function getEstimatedBridgeTime(fromChain: Chain, toChain: Chain): string {
  // Simple estimation logic
  if (fromChain.features.highThroughput || toChain.features.highThroughput) {
    return '2-5 minutes';
  }
  if (fromChain.chainId === 8453 || toChain.chainId === 8453) { // Base
    return '5-10 minutes';
  }
  return '10-15 minutes';
}

function calculateBridgeFee(amount: string): number {
  if (!amount || parseFloat(amount) <= 0) return 0;
  return parseFloat(amount) * 0.005; // 0.5% fee
}