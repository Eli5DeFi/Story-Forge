'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Coins, Sparkles, Users, Zap, Shield, Globe } from 'lucide-react';
import { CyberButton } from '@/components/ui/cyber-button';
import { CyberCard, CyberCardContent, CyberCardHeader } from '@/components/ui/cyber-card';
import { DataPanel, StatCard as DataStatCard, CyberProgress } from '@/components/ui/data-panel';
import { GlitchText, TypewriterText, ScrambleText } from '@/components/ui/glitch-text';
import { ParticleBackground } from '@/components/ui/particle-background';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col relative">
      {/* Particle Background */}
      {mounted && (
        <ParticleBackground
          particleCount={60}
          colors={['#00f0ff', '#bf00ff', '#f59e0b']}
          speed={0.3}
          connectDistance={120}
        />
      )}

      {/* Noise overlay for texture */}
      <div className="noise-overlay" />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated grid background */}
        <div className="absolute inset-0 grid-bg opacity-30" />

        {/* Radial gradients */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-3xl" />
        </div>

        {/* Scan line effect */}
        <div className="absolute inset-0 scan-line-moving pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-5xl text-center">
            {/* HUD-style decorative elements */}
            <div className="flex justify-center mb-8">
              <div className="hud-element animate-fade-in">System Online</div>
            </div>

            {/* Main title with glitch effect */}
            <h1 className="font-fantasy text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl mb-6">
              <GlitchText
                text="STORY"
                className="text-gradient-cyber"
                glitchOnHover
              />
              <span className="text-foreground">-</span>
              <GlitchText
                text="FORGE"
                className="text-gradient-gold"
                glitchOnHover
              />
            </h1>

            {/* Animated tagline */}
            <div className="h-8 mb-6">
              {mounted && (
                <TypewriterText
                  text="Where AI Weaves Tales & You Shape Destiny"
                  className="text-xl md:text-2xl text-neon-blue"
                  speed={40}
                />
              )}
            </div>

            {/* Description with cyber styling */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed animate-slide-up">
              Experience the first interactive AI-generated fantasy web novel.
              Every 3 days, a new chapter unfolds. Predict the outcome, stake
              your conviction, and let the story reward you.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/stories">
                <CyberButton variant="gold" size="lg" glow>
                  Begin Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </CyberButton>
              </Link>
              <Link href="/about">
                <CyberButton variant="neon" size="lg">
                  Learn More
                </CyberButton>
              </Link>
            </div>

            {/* Quick stats bar */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <QuickStat value="12" label="Chapters" />
              <QuickStat value="$125K+" label="Predictions" />
              <QuickStat value="2,847" label="Readers" />
              <QuickStat value="156" label="NFTs" />
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 hex-bg opacity-20" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="hud-element mb-4 inline-block">System Features</span>
            <h2 className="font-fantasy text-4xl font-bold md:text-5xl">
              <span className="text-gradient-cyber">How It Works</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<BookOpen className="h-6 w-6" />}
              title="AI-Generated Stories"
              description="Experience rich fantasy narratives crafted by advanced AI, with new chapters every 3 days."
              index={0}
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="Predict Outcomes"
              description="At each chapter's end, choose from 4-5 possible story directions. Stake your prediction."
              index={1}
            />
            <FeatureCard
              icon={<Coins className="h-6 w-6" />}
              title="Winner Takes All"
              description="Correct predictions share 85% of the pool. No minimum bet - anyone can participate."
              index={2}
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Collect & Explore"
              description="Every character, item, and creature becomes a unique 1/1 NFT. Build your collection."
              index={3}
            />
          </div>
        </div>
      </section>

      {/* Current Story Preview */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-blue/5 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="hud-element mb-2 inline-block">Active Mission</span>
                <h2 className="font-fantasy text-3xl font-bold">
                  <span className="text-gradient-gold">Currently Reading</span>
                </h2>
              </div>
              <Link
                href="/stories"
                className="text-neon-blue hover:text-neon-blue/80 transition-colors flex items-center gap-2"
              >
                View All Stories
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <CyberCard variant="holo" corners scanLine className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Story cover */}
                <div className="relative aspect-video md:aspect-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/30 via-neon-blue/20 to-gold-500/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-neon-blue/50 flex items-center justify-center bg-void-950/50">
                        <BookOpen className="h-10 w-10 text-neon-blue" />
                      </div>
                      <span className="text-xs uppercase tracking-widest text-neon-blue/70">Fantasy Epic</span>
                    </div>
                  </div>
                  {/* Corner decorations */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-neon-blue/30" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-neon-blue/30" />
                </div>

                {/* Story info */}
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 text-xs font-medium border border-gold-500/30">
                      Chapter 12
                    </span>
                    <span className="px-3 py-1 rounded-full bg-neon-purple/20 text-neon-purple text-xs font-medium border border-neon-purple/30">
                      Fantasy
                    </span>
                    <span className="status-online text-xs text-neon-green">Active</span>
                  </div>

                  <h3 className="font-fantasy text-2xl font-bold mb-3">
                    <ScrambleText text="Chronicles of Aethermoor" />
                  </h3>

                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    In a world where magic flows like rivers and ancient beings
                    slumber beneath forgotten ruins, a reluctant hero must choose
                    between duty and destiny...
                  </p>

                  {/* Betting progress */}
                  <DataPanel title="Prediction Pool" status="online" className="mb-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Pool</span>
                        <span className="font-mono text-gold-400">42,500 USDC</span>
                      </div>
                      <CyberProgress value={42500} max={100000} showValue={false} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1,247 predictions</span>
                        <span>2d 14h remaining</span>
                      </div>
                    </div>
                  </DataPanel>

                  <Link href="/stories/chronicles-of-aethermoor">
                    <CyberButton variant="cyber" className="w-full">
                      Read & Predict
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </CyberButton>
                  </Link>
                </div>
              </div>
            </CyberCard>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="hud-element mb-4 inline-block">System Metrics</span>
            <h2 className="font-fantasy text-3xl font-bold">
              <span className="text-gradient-cyber">Platform Statistics</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DataStatCard
              label="Chapters Published"
              value="12"
              change="+2 this week"
              changeType="positive"
              icon={<BookOpen className="h-5 w-5" />}
            />
            <DataStatCard
              label="Total Predictions"
              value="$125K+"
              change="+15% growth"
              changeType="positive"
              icon={<Coins className="h-5 w-5" />}
            />
            <DataStatCard
              label="Active Readers"
              value="2,847"
              change="+342 new"
              changeType="positive"
              icon={<Users className="h-5 w-5" />}
            />
            <DataStatCard
              label="NFTs Minted"
              value="156"
              change="12 available"
              changeType="neutral"
              icon={<Sparkles className="h-5 w-5" />}
            />
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 diagonal-lines opacity-30" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            <TechCard
              icon={<Zap className="h-8 w-8" />}
              title="AI-Powered"
              description="Advanced language models create immersive narratives with consistent world-building and character development."
            />
            <TechCard
              icon={<Shield className="h-8 w-8" />}
              title="Blockchain Secured"
              description="All predictions and payouts secured on Base L2. Transparent, trustless, and verifiable on-chain."
            />
            <TechCard
              icon={<Globe className="h-8 w-8" />}
              title="Web3 Native"
              description="Connect any wallet. Earn through predictions. Collect unique NFTs. Own your story experience."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 via-neon-purple/10 to-gold-500/10" />
          <div className="absolute inset-0 grid-bg opacity-20" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-8">
              <div className="corner-brackets p-8">
                <h2 className="font-fantasy text-4xl font-bold md:text-5xl mb-4">
                  Ready to{' '}
                  <span className="text-gradient-gold">Shape the Story</span>?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Connect your wallet, make your predictions, and become part of the
                  narrative. The next chapter awaits your decision.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/stories">
                <CyberButton variant="gold" size="lg" glow>
                  Start Predicting
                  <ArrowRight className="ml-2 h-5 w-5" />
                </CyberButton>
              </Link>
              <Link href="/compendium">
                <CyberButton variant="ghost" size="lg">
                  Explore Compendium
                </CyberButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-mono text-2xl font-bold text-neon-blue">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <CyberCard
      variant="default"
      className="animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
    >
      <CyberCardHeader icon={icon}>{title}</CyberCardHeader>
      <CyberCardContent>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CyberCardContent>
    </CyberCard>
  );
}

function TechCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative p-8 rounded-lg border border-neon-blue/10 bg-void-950/60 backdrop-blur-sm hover:border-neon-blue/30 transition-all">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center text-neon-blue mb-6 border border-neon-blue/20">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
