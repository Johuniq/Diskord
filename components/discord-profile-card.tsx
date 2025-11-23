"use client";

import type { DiscordProfile } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { toPng } from "html-to-image";
import { Check, Download } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export type { DiscordProfile as DiscordProfileData };

interface DiscordProfileCardProps {
  profile: DiscordProfile;
}

const RARITY_COLORS = {
  COMMON: {
    main: "#A3A3A3",
    glow: "rgba(163,163,163,0.5)",
    bg: "from-gray-900 to-gray-800",
  },
  RARE: {
    main: "#3B82F6",
    glow: "rgba(59,130,246,0.6)",
    bg: "from-blue-950 to-slate-900",
  },
  EPIC: {
    main: "#9333EA",
    glow: "rgba(147,51,234,0.6)",
    bg: "from-purple-950 to-slate-900",
  },
  LEGENDARY: {
    main: "#EAB308",
    glow: "rgba(234,179,8,0.7)",
    bg: "from-yellow-950 to-amber-900",
  },
  MYTHIC: {
    main: "#EF4444",
    glow: "rgba(239,68,68,0.8)",
    bg: "from-red-950 to-red-900",
  },
};

const BADGE_ICONS: Record<string, string> = {
  Staff: "https://cdn.discordapp.com/badge-icons/5e74e9b6d94a4d6ed7ea.png",
  Partner:
    "https://cdn.discordapp.com/badge-icons/3f9748e53446a137f056295d986dea99.png",
  "HypeSquad Events":
    "https://cdn.discordapp.com/badge-icons/bf01d10758569c37a2d7272ece70b9b5.png",
  "Bug Hunter Level 1":
    "https://cdn.discordapp.com/badge-icons/2717692c7dca7227c3922800e7d5f1d9.png",
  "HypeSquad Bravery":
    "https://cdn.discordapp.com/badge-icons/8a88d638f363a5565e4b.png",
  "HypeSquad Brilliance":
    "https://cdn.discordapp.com/badge-icons/01194027dcc0ad9199a8.png",
  "HypeSquad Balance":
    "https://cdn.discordapp.com/badge-icons/3aa41de486fa12454c3761e8e223442e.png",
  "Early Supporter":
    "https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png",
  "Verified Developer":
    "https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png",
  "Active Developer":
    "https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png",
  "Certified Moderator":
    "https://cdn.discordapp.com/badge-icons/fee1624003e2fee35cb398e125dc479b.png",
};

const BadgeItem = ({ name }: { name: string }) => {
  const iconUrl = BADGE_ICONS[name];

  if (iconUrl) {
    return (
      <div
        className="flex items-center justify-center bg-[#1e1f22] p-1 rounded-[6px] cursor-help group relative hover:bg-[#2b2d31] transition-colors min-w-[28px] min-h-[28px]"
        title={name}
      >
        <img
          src={iconUrl || "/placeholder.svg"}
          alt={name}
          className="w-5 h-5 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
        />
      </div>
    );
  }

  // Fallback for custom text badges (Veteran, Netizen, etc)
  return (
    <div
      className="flex items-center justify-center bg-[#1e1f22] px-2 py-1 rounded-[6px] text-[10px] text-[#b5bac1] font-medium cursor-help group relative hover:bg-[#2b2d31] transition-colors border border-[#2b2d31] hover:border-[#b5bac1]"
      title={`Badge: ${name}`}
    >
      {name.toUpperCase()}
    </div>
  );
};

export default function DiscordProfileCard({
  profile,
}: DiscordProfileCardProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse position for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);
  const brightness = useTransform(mouseYSpring, [-0.5, 0.5], [1.05, 0.95]);

  const rarity = RARITY_COLORS[profile.rarity];
  const accentColor = profile.accent_color
    ? `#${profile.accent_color.toString(16).padStart(6, "0")}`
    : rarity.main;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`https://discord.com/users/${profile.id}`);
    setCopied(true);
    toast.success("Discord ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3, // Higher quality
        backgroundColor: "#111214", // Ensure background is set
      });

      const link = document.createElement("a");
      link.download = `${profile.username}-discord-card.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Card downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate image.");
    } finally {
      setIsDownloading(false);
    }
  };

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="perspective-1000 w-full max-w-[90vw] sm:max-w-[340px] mx-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full rounded-[16px] overflow-hidden shadow-2xl transition-all duration-200 ease-out"
      >
        {/* Main Card Container - Discord Dark Theme */}
        <div
          ref={cardRef}
          className="bg-[#111214] h-full flex flex-col relative z-10"
        >
          {/* Banner */}
          <div
            className="h-[120px] w-full relative overflow-hidden"
            style={{
              background: profile.banner || accentColor,
              backgroundColor: accentColor,
            }}
          >
            {/* Rarity Badge (Top Right) */}
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold shadow-sm hover:bg-black/60 transition-colors">
                <span style={{ color: rarity.main }} className="mr-1">
                  ●
                </span>
                {profile.rarity}
              </Badge>
            </div>
          </div>

          {/* Avatar Container */}
          <div className="px-4 pb-4 relative">
            <div className="absolute -top-[50px] left-[16px] p-[6px] bg-[#111214] rounded-full">
              <div className="relative">
                <img
                  src={
                    profile.avatar
                      ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=256`
                      : "https://cdn.discordapp.com/embed/avatars/0.png"
                  }
                  alt={profile.username}
                  className="w-[80px] h-[80px] rounded-full object-cover relative z-10"
                  crossOrigin="anonymous"
                />
                {/* Status Indicator (Online/Mobile/Etc) - Mocked as 'online' */}
                <div className="absolute bottom-0 right-0 w-[26px] h-[26px] bg-[#111214] rounded-full flex items-center justify-center z-20">
                  <div className="w-[16px] h-[16px] rounded-full bg-[#23a559]" />
                </div>
              </div>
            </div>

            {/* Badges Row */}
            <div className="flex justify-end pt-3 gap-1.5 min-h-[40px] flex-wrap w-[200px] ml-auto">
              {profile.badges.map((badge) => (
                <BadgeItem key={badge} name={badge} />
              ))}
            </div>

            {/* User Identity */}
            <div className="mt-3 bg-[#111214] rounded-[8px] p-3.5 mb-3 border border-[#1e1f22]">
              <h2 className="text-xl font-bold text-white leading-tight break-all">
                {profile.global_name || profile.username}
              </h2>
              <p className="text-sm text-[#b5bac1] font-medium break-all">
                {profile.username}
              </p>

              {/* Custom Status */}
              <div className="mt-3 flex items-center gap-2 text-sm text-[#dbdee1]">
                <span>{profile.bio}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] w-full bg-[#2e3035] my-3" />

            {/* About Me / Stats Section */}
            <div className="space-y-3">
              <div className="uppercase text-[11px] font-bold text-[#b5bac1] tracking-wide mb-1">
                About Me
              </div>

              <div className="grid gap-2">
                {/* Stat: Class */}
                <div className="flex items-center gap-3 text-sm text-[#dbdee1]">
                  <div className="w-4 text-center">⚔️</div>
                  <span>
                    Class:{" "}
                    <span className="text-white font-medium">
                      {profile.classType}
                    </span>
                  </span>
                </div>

                {/* Stat: Power Level */}
                <div className="flex items-center gap-3 text-sm text-[#dbdee1]">
                  <div className="w-4 text-center">⚡</div>
                  <span>
                    Power Level:{" "}
                    <span style={{ color: rarity.main }} className="font-bold">
                      {profile.powerLevel.toLocaleString()}
                    </span>
                  </span>
                </div>

                {/* Stat: Member Since */}
                <div className="flex items-center gap-3 text-sm text-[#dbdee1]">
                  <div className="w-4 text-center">📅</div>
                  <span>
                    Member since{" "}
                    <span className="text-white font-medium">{joinDate}</span>
                  </span>
                </div>
              </div>

              {/* Roles Section */}
              <div className="mt-4">
                <div className="uppercase text-[11px] font-bold text-[#b5bac1] tracking-wide mb-2">
                  Roles
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-[#2b2d31] rounded-[4px] text-xs font-medium text-[#dbdee1] border border-[#1e1f22]">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: rarity.main }}
                    />
                    {profile.rarity}
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-[#2b2d31] rounded-[4px] text-xs font-medium text-[#dbdee1] border border-[#1e1f22]">
                    <div className="w-3 h-3 rounded-full bg-[#5865F2]" />
                    Verified
                  </div>
                </div>
              </div>
            </div>

            {/* Branding Footer */}
            <div className="mt-6 pt-3 border-t border-[#2e3035] flex justify-center">
              <p className="text-[10px] text-[#5c5e66] font-mono tracking-widest uppercase">
                Generated by Diskord
              </p>
            </div>
          </div>
        </div>

        {/* Glossy Overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-30"
          style={{
            background: `linear-gradient(105deg, transparent 40%, rgba(255,255,256,0.4) 45%, rgba(255,255,255,0.2) 50%, transparent 55%)`,
            filter: `brightness(${brightness})`,
            backgroundSize: "200% 200%",
            backgroundPositionX: useTransform(
              mouseXSpring,
              [-0.5, 0.5],
              ["100%", "0%"]
            ),
          }}
        />
      </motion.div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-2">
        <Button
          onClick={copyProfileLink}
          className="flex-1 bg-[#5865F2] hover:bg-[#4752c4] text-white h-[38px] text-sm font-medium transition-colors rounded-[3px]"
        >
          {copied ? <Check className="w-4 h-4 mr-2" /> : "Copy ID"}
        </Button>
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 bg-[#2b2d31] hover:bg-[#35373c] text-white h-[38px] text-sm font-medium transition-colors rounded-[3px] border border-[#1e1f22]"
        >
          {isDownloading ? (
            <span className="animate-pulse">Saving...</span>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Save Card
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
