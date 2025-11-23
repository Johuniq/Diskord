import { getDiscordProfile, getRepoStars } from "@/app/actions";
import DiscordProfileCard from "@/components/discord-profile-card";
import { SearchForm } from "@/components/search-form"; // Import new component
import { Button } from "@/components/ui/button";
import { Github, RefreshCcw, Sparkles, Star } from "lucide-react";
import type { Metadata } from "next"; // Import Metadata type
import Link from "next/link";
import { Suspense } from "react";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { id?: string };
}): Promise<Metadata> {
  if (searchParams.id) {
    const ogImageUrl = `/api/og?id=${searchParams.id}`;
    // Fetch the profile to get actual rarity
    const profile = await getDiscordProfile(searchParams.id);
    let rarity = "Legendary";
    if (profile && !("error" in profile) && profile.rarity) {
      rarity = profile.rarity.charAt(0) + profile.rarity.slice(1).toLowerCase();
    }
    return {
      title: `Profile #${searchParams.id} - Diskord Legends`,
      description: `Check out this holographic Discord profile card for user ${searchParams.id}. See their rarity, class, and power level!`,
      openGraph: {
        title: `${rarity} Profile Found: #${searchParams.id}`,
        description: `Check out this holographic Discord profile card. Rarity: ${rarity}, Class, and Power Level revealed.`,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `Discord Profile Card for ${searchParams.id}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `Profile #${searchParams.id} - Diskord Legends`,
        description: `Rarity: ${rarity}, Class, and Power Level revealed for user ${searchParams.id}`,
        images: [ogImageUrl],
      },
    };
  }
  return {
    title: "Diskord Legends - Generate Your Holographic Profile",
    description:
      "Generate a unique, rarity-based Discord profile card with holographic effects.",
    openGraph: {
      images: ["/api/og"], // Default OG image
    },
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const stars = await getRepoStars("Johuniq", "diskord");
  const formattedStars = stars
    ? stars > 1000
      ? (stars / 1000).toFixed(1) + "k"
      : stars
    : "Star";
  const hasId = !!searchParams.id;

  return (
    <main className="min-h-screen bg-black overflow-x-hidden flex items-center justify-center relative selection:bg-purple-500/30 pb-20 lg:pb-0">
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-xl tracking-tight">
            Diskord
          </span>
        </div>
        <Button
          variant="outline"
          className="bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2 rounded-full hidden sm:flex"
          asChild
        >
          <Link href="https://github.com/Johuniq/diskord" target="_blank">
            <Github className="w-4 h-4" />
            <div className="flex items-center gap-1 pl-2 border-l border-white/10 ml-1 text-white/60">
              <Star className="w-3 h-3" />
              <span className="text-xs">{formattedStars}</span>
            </div>
          </Link>
        </Button>
        {/* Mobile Icon Only */}
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/5 text-white hover:bg-white/10 rounded-full sm:hidden"
          asChild
        >
          <Link href="https://github.com/Johuniq/diskord" target="_blank">
            <Github className="w-5 h-5" />
          </Link>
        </Button>
      </nav>

      {/* Ambient Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-900/20 rounded-full blur-[80px] md:blur-[128px] animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-900/20 rounded-full blur-[80px] md:blur-[128px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 relative z-10 h-full py-24 lg:py-12 flex flex-col items-center justify-center">
        {!hasId ? (
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            {/* Left Column: Input & Hero Text */}
            <div className="space-y-8 text-center lg:text-left relative z-20">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/60 backdrop-blur-xl">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <span>VERSION 1.0 • DISCORD LEGENDS LIVE</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white">
                  DISCORD <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    LEGENDS
                  </span>
                </h1>
                <p className="text-base md:text-lg text-white/40 max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Generate your holographic Trading Card based on your Discord
                  account age and flags. What rarity will you pull?
                </p>
              </div>

              {/* Search Form */}
              <SearchForm />

              {/* Stats / Social Proof */}
              <div className="pt-8 border-t border-white/5 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-bold text-white">2,345</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">
                    Cards Generated
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    Legendary
                  </div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">
                    Most Pulled Rarity
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">8 yrs</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">
                    Oldest Account Age
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Empty State */}
            <div className="flex justify-center items-center perspective-1000">
              <EmptyCardState />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-8 w-full animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center items-center perspective-1000">
              <Suspense fallback={<CardSkeleton />}>
                <ProfileResult id={searchParams.id} />
              </Suspense>
            </div>

            <Button
              asChild
              variant="secondary"
              size="lg"
              className="rounded-full px-8 bg-white text-black hover:bg-white/90 font-medium gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all"
            >
              <Link href="/">
                <RefreshCcw className="w-4 h-4" />
                Generate Another
              </Link>
            </Button>
          </div>
        )}
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center z-50 p-4">
        <p className="text-white/30 text-sm font-mono">
          Built by{" "}
          <span className="text-white/60 hover:text-white transition-colors">
            Johuniq
          </span>
          . The source code is available on{" "}
          <Link
            href="https://github.com/Johuniq/diskord"
            className="text-white/60 hover:text-white underline transition-colors"
          >
            GitHub
          </Link>
          .
        </p>
      </footer>
    </main>
  );
}

async function ProfileResult({ id }: { id?: string }) {
  if (!id) return <EmptyCardState />;

  const profile = await getDiscordProfile(id);

  if ("error" in profile) {
    return (
      <div className="w-full max-w-md aspect-[4/5] rounded-3xl border-2 border-dashed border-red-500/30 bg-red-950/10 flex flex-col items-center justify-center text-center p-8 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent -translate-y-full animate-[shimmer_2s_infinite]" />
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="text-xl font-bold text-red-500 mb-2">System Error</h3>
        <p className="text-red-200/60 text-sm">{profile.error}</p>
      </div>
    );
  }

  return <DiscordProfileCard profile={profile} />;
}

function EmptyCardState() {
  return (
    <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-center p-8 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent -translate-y-full animate-[shimmer_2s_infinite]" />
      <Sparkles className="w-12 h-12 text-white/20 mb-4" />
      <p className="text-white/30 font-mono text-sm">
        Waiting for ID signal...
      </p>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="w-full max-w-md aspect-[4/5] rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1s_infinite]" />
    </div>
  );
}
