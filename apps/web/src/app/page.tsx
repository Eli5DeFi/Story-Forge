import Link from 'next/link';
import { ArrowRight, BookOpen, Coins, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-fantasy text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">
                Story-Forge
              </span>
            </h1>
            <p className="mt-4 text-xl text-muted-foreground md:text-2xl">
              Where AI Weaves Tales & You Shape Destiny
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Experience the first interactive AI-generated fantasy web novel.
              Every 3 days, a new chapter unfolds. Predict the outcome, stake
              your conviction, and let the story reward you.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="glow-gold" asChild>
                <Link href="/stories">
                  Begin Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center font-fantasy text-3xl font-bold md:text-4xl">
            How It Works
          </h2>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              title="AI-Generated Stories"
              description="Experience rich fantasy narratives crafted by advanced AI, with new chapters every 3 days."
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8" />}
              title="Predict Outcomes"
              description="At each chapter's end, choose from 4-5 possible story directions. Stake your prediction."
            />
            <FeatureCard
              icon={<Coins className="h-8 w-8" />}
              title="Winner Takes All"
              description="Correct predictions share 85% of the pool. No minimum bet - anyone can participate."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Collect & Explore"
              description="Every character, item, and creature becomes a unique 1/1 NFT. Build your collection."
            />
          </div>
        </div>
      </section>

      {/* Current Story Preview */}
      <section className="bg-card py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between">
              <h2 className="font-fantasy text-3xl font-bold">
                Currently Reading
              </h2>
              <Link
                href="/stories"
                className="text-primary hover:underline"
              >
                View All Stories
              </Link>
            </div>
            <div className="mt-8 overflow-hidden rounded-xl border border-border bg-background">
              <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-blue-900/50" />
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="rounded-full bg-primary/20 px-2 py-1 text-primary">
                    Chapter 12
                  </span>
                  <span>Fantasy</span>
                  <span>•</span>
                  <span>Active</span>
                </div>
                <h3 className="mt-4 font-fantasy text-2xl font-bold">
                  Chronicles of Aethermoor
                </h3>
                <p className="mt-2 text-muted-foreground">
                  In a world where magic flows like rivers and ancient beings
                  slumber beneath forgotten ruins, a reluctant hero must choose
                  between duty and destiny...
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span className="text-primary font-bold">42,500 USDC</span>{' '}
                    in active predictions
                  </div>
                  <Button asChild>
                    <Link href="/stories/chronicles-of-aethermoor">
                      Read & Predict
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <StatCard value="12" label="Chapters Published" />
            <StatCard value="$125K+" label="Total Predictions" />
            <StatCard value="2,847" label="Active Readers" />
            <StatCard value="156" label="NFTs Minted" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/20 via-amber-500/20 to-primary/20 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-fantasy text-3xl font-bold md:text-4xl">
            Ready to Shape the Story?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Connect your wallet, make your predictions, and become part of the
            narrative. The next chapter awaits your decision.
          </p>
          <Button size="lg" className="mt-8 glow-gold" asChild>
            <Link href="/stories">
              Start Predicting
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
      <div className="inline-flex rounded-lg bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-fantasy text-4xl font-bold text-primary">{value}</div>
      <div className="mt-2 text-muted-foreground">{label}</div>
    </div>
  );
}
