'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UsersIcon,
  SparklesIcon,
  TrophyIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

interface CreatorStats {
  totalStories: number;
  totalEarnings: number;
  monthlyEarnings: number;
  totalReaders: number;
  averageRating: number;
  completionRate: number;
  viralScore: number;
  rank: number;
}

interface StoryUniverse {
  id: number;
  title: string;
  description: string;
  genre: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  chapters: number;
  readers: number;
  earnings: number;
  rating: number;
  imageUrl?: string;
  createdAt: string;
  lastUpdate: string;
}

export default function CreatorDashboard() {
  const [stats, setStats] = useState<CreatorStats>({
    totalStories: 3,
    totalEarnings: 2847.50,
    monthlyEarnings: 534.20,
    totalReaders: 15420,
    averageRating: 4.7,
    completionRate: 78.5,
    viralScore: 1250,
    rank: 47,
  });

  const [universes, setUniverses] = useState<StoryUniverse[]>([
    {
      id: 1,
      title: "Chronicles of the Digital Realm",
      description: "A cyberpunk fantasy where AI consciousness meets ancient magic",
      genre: "Cyberpunk Fantasy",
      status: "active",
      chapters: 12,
      readers: 8420,
      earnings: 1547.30,
      rating: 4.8,
      imageUrl: "/story-images/digital-realm.jpg",
      createdAt: "2024-11-15",
      lastUpdate: "2025-01-28",
    },
    {
      id: 2,
      title: "The Prediction Wars",
      description: "In a world where seeing the future is a weapon, one prophet holds the key",
      genre: "Sci-Fi Thriller",
      status: "active",
      chapters: 8,
      readers: 5240,
      earnings: 892.40,
      rating: 4.6,
      imageUrl: "/story-images/prediction-wars.jpg",
      createdAt: "2024-12-03",
      lastUpdate: "2025-01-27",
    },
    {
      id: 3,
      title: "Mystic Markets",
      description: "A financial wizard discovers that cryptocurrency predictions control reality",
      genre: "Urban Fantasy",
      status: "draft",
      chapters: 3,
      readers: 1760,
      earnings: 407.80,
      rating: 4.7,
      imageUrl: "/story-images/mystic-markets.jpg",
      createdAt: "2025-01-10",
      lastUpdate: "2025-01-26",
    },
  ]);

  const [selectedTab, setSelectedTab] = useState<'overview' | 'stories' | 'analytics' | 'earnings'>('overview');

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    subtitle 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string; 
    subtitle?: string; 
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Build, monetize, and grow your story universes
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                <PlusIcon className="h-5 w-5" />
                <span>New Universe</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: 'Overview', icon: ChartBarIcon },
                { key: 'stories', label: 'My Universes', icon: BookOpenIcon },
                { key: 'analytics', label: 'Analytics', icon: UsersIcon },
                { key: 'earnings', label: 'Earnings', icon: CurrencyDollarIcon },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedTab(key as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === key
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Earnings"
                value={formatCurrency(stats.totalEarnings)}
                icon={CurrencyDollarIcon}
                color="bg-green-500"
                subtitle={`+${formatCurrency(stats.monthlyEarnings)} this month`}
              />
              <StatCard
                title="Total Readers"
                value={stats.totalReaders.toLocaleString()}
                icon={UsersIcon}
                color="bg-blue-500"
                subtitle="Across all universes"
              />
              <StatCard
                title="Viral Score"
                value={stats.viralScore}
                icon={SparklesIcon}
                color="bg-purple-500"
                subtitle={`Rank #${stats.rank} globally`}
              />
              <StatCard
                title="Avg Rating"
                value={`${stats.averageRating}/5.0`}
                icon={HeartIcon}
                color="bg-red-500"
                subtitle={`${stats.completionRate}% completion rate`}
              />
            </div>

            {/* Recent Activity & Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Earned $127.50 from Chapter 12 predictions</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <EyeIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">847 new readers joined "Digital Realm"</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ShareIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Your story went viral on Twitter (2.3K shares)</p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <TrophyIcon className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Viral Creator</p>
                      <p className="text-xs text-gray-600">Achieved 1000+ viral score</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Revenue Milestone</p>
                      <p className="text-xs text-gray-600">Earned over $2,500 total</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <UsersIcon className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Community Builder</p>
                      <p className="text-xs text-gray-600">10,000+ total readers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'stories' && (
          <div className="space-y-6">
            {/* Universe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {universes.map((universe) => (
                <motion.div
                  key={universe.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {universe.imageUrl && (
                    <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600">
                      {/* Placeholder for story image */}
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{universe.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(universe.status)}`}>
                        {universe.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{universe.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Chapters</p>
                        <p className="text-sm font-semibold text-gray-900">{universe.chapters}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Readers</p>
                        <p className="text-sm font-semibold text-gray-900">{universe.readers.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Earnings</p>
                        <p className="text-sm font-semibold text-green-600">{formatCurrency(universe.earnings)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rating</p>
                        <p className="text-sm font-semibold text-gray-900">⭐ {universe.rating}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-indigo-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                        Edit
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                        Analytics
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Coming Soon</h3>
              <p className="text-gray-600">
                Detailed analytics including reader engagement, prediction accuracy, viral trends, and revenue optimization will be available here.
              </p>
            </div>
          </div>
        )}

        {selectedTab === 'earnings' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Dashboard Coming Soon</h3>
              <p className="text-gray-600">
                Track your revenue streams, payout schedules, $STORY token rewards, and revenue sharing analytics.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}