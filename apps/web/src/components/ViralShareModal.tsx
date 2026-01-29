'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  ShareIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowPathRoundedSquareIcon,
  SparklesIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface ShareContent {
  type: 'prediction' | 'story_outcome' | 'achievement' | 'creator_milestone';
  title: string;
  description: string;
  imageUrl?: string;
  storyId?: number;
  chapterId?: number;
}

interface ViralMoment {
  shares: number;
  views: number;
  engagements: number;
  viralScore: number;
}

interface ViralShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ShareContent;
  shareUrls: {
    twitter: string;
    discord: any;
    reddit: string;
    general: string;
  };
}

export default function ViralShareModal({ 
  isOpen, 
  onClose, 
  content, 
  shareUrls 
}: ViralShareModalProps) {
  const [viralMoment, setViralMoment] = useState<ViralMoment | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const [hasShared, setHasShared] = useState(false);

  const shareId = `share_${content.type}_${Date.now()}`;

  useEffect(() => {
    if (isOpen) {
      trackViralMoment('view');
    }
  }, [isOpen]);

  const trackViralMoment = async (action: 'share' | 'view' | 'engagement', platform?: string) => {
    try {
      const response = await fetch(`/api/social/viral/${shareId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, platform }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setViralMoment(result.data);
        }
      }
    } catch (error) {
      console.error('Error tracking viral moment:', error);
    }
  };

  const handleShare = async (platform: string, url: string) => {
    setIsSharing(true);
    
    try {
      // Open share URL
      if (platform === 'discord') {
        // For Discord, copy to clipboard
        await navigator.clipboard.writeText(
          `**${content.title}**\n\n${content.description}\n\nJoin Story-Forge: https://storyforge.ai`
        );
        setShareSuccess('Discord message copied to clipboard!');
      } else {
        window.open(url, '_blank', 'width=600,height=400');
        setShareSuccess(`Shared to ${platform}!`);
      }

      // Track the share
      await trackViralMoment('share', platform);
      setHasShared(true);
      
      // Auto-close success message
      setTimeout(() => setShareSuccess(null), 3000);
      
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrls.general);
      setShareSuccess('Link copied to clipboard!');
      await trackViralMoment('engagement', 'clipboard');
      setTimeout(() => setShareSuccess(null), 3000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const platforms = [
    {
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-blue-500 hover:bg-blue-600',
      url: shareUrls.twitter,
    },
    {
      name: 'Discord',
      icon: '💬',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      url: 'discord',
    },
    {
      name: 'Reddit',
      icon: '📱',
      color: 'bg-orange-500 hover:bg-orange-600',
      url: shareUrls.reddit,
    },
  ];

  const getViralBadge = () => {
    if (!viralMoment) return null;
    
    if (viralMoment.viralScore >= 1000) {
      return { text: '🔥 VIRAL!', color: 'text-red-500' };
    } else if (viralMoment.viralScore >= 500) {
      return { text: '⚡ Trending', color: 'text-yellow-500' };
    } else if (viralMoment.viralScore >= 100) {
      return { text: '✨ Popular', color: 'text-green-500' };
    }
    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <ShareIcon className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Share Your Moment
                  </h3>
                  {getViralBadge() && (
                    <span className={`text-sm font-bold ${getViralBadge()?.color}`}>
                      {getViralBadge()?.text}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Content Preview */}
              <div className="mb-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
                {content.imageUrl && (
                  <img
                    src={content.imageUrl}
                    alt="Share content"
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h4 className="font-semibold text-gray-900 mb-2">
                  {content.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {content.description}
                </p>
              </div>

              {/* Viral Stats */}
              {viralMoment && (
                <div className="mb-6 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <ArrowPathRoundedSquareIcon className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {viralMoment.shares}
                    </div>
                    <div className="text-xs text-gray-500">Shares</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <HeartIcon className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {viralMoment.views}
                    </div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <SparklesIcon className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {viralMoment.viralScore}
                    </div>
                    <div className="text-xs text-gray-500">Viral Score</div>
                  </div>
                </div>
              )}

              {/* Share Platforms */}
              <div className="space-y-3 mb-6">
                {platforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handleShare(platform.name.toLowerCase(), platform.url)}
                    disabled={isSharing}
                    className={`w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-lg text-white font-medium transition-all ${platform.color} ${
                      isSharing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <span className="text-lg">{platform.icon}</span>
                    <span>Share on {platform.name}</span>
                  </button>
                ))}
              </div>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 border-gray-200 hover:border-indigo-300 text-gray-700 font-medium transition-all"
              >
                <ChatBubbleLeftIcon className="h-4 w-4" />
                <span>Copy Link</span>
              </button>

              {/* Success Message */}
              <AnimatePresence>
                {shareSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-4 left-4 right-4 bg-green-500 text-white text-center py-2 px-4 rounded-lg text-sm font-medium"
                  >
                    {shareSuccess}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reward Hint */}
              {hasShared && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                >
                  <div className="flex items-center space-x-2">
                    <TrophyIcon className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="text-sm font-semibold text-yellow-800">
                        Earning Viral Points!
                      </div>
                      <div className="text-xs text-yellow-600">
                        Keep sharing to climb the leaderboard and earn $STORY rewards
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}