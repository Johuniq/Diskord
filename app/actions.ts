"use server";

import { z } from "zod";

const DiscordProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  global_name: z.string().nullable(),
  avatar: z.string().nullable(),
  accent_color: z.number().nullable(),
  banner_color: z.string().nullable(),
  created_at: z.number(),
  premium_type: z.number().nullable().optional(),
  public_flags: z.number().optional(),
});

export type DiscordProfile = z.infer<typeof DiscordProfileSchema> & {
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
  powerLevel: number;
  element: string;
  joinRank: string;
  classType: string;
  badges: string[];
  bio: string;
  repoStars: number | null;
  banner: string;
};

function getBadges(flags = 0, createdAt: number): string[] {
  const badges: string[] = [];
  if (flags & (1 << 0)) badges.push("Staff");
  if (flags & (1 << 1)) badges.push("Partner");
  if (flags & (1 << 2)) badges.push("HypeSquad Events");
  if (flags & (1 << 3)) badges.push("Bug Hunter Level 1");
  if (flags & (1 << 6)) badges.push("HypeSquad Bravery");
  if (flags & (1 << 7)) badges.push("HypeSquad Brilliance");
  if (flags & (1 << 8)) badges.push("HypeSquad Balance");
  if (flags & (1 << 9)) badges.push("Early Supporter");
  if (flags & (1 << 17)) badges.push("Verified Developer");
  if (flags & (1 << 18)) badges.push("Certified Moderator");
  if (flags & (1 << 22)) badges.push("Active Developer");

  // This ensures the badge area isn't empty or boring for normal users
  if (badges.length === 0) {
    const now = Date.now();
    const years = (now - createdAt) / (1000 * 60 * 60 * 24 * 365);

    if (years >= 7) badges.push("Discord Elder");
    else if (years >= 5) badges.push("Veteran");
    else if (years >= 3) badges.push("Established");
    else if (years <= 0.1) badges.push("New Arrival");
    else badges.push("Netizen");
  }

  return badges;
}

function generateBio(
  id: string,
  username: string,
  classType: string,
  rarity: string
): string {
  // seeded random using the ID to ensure it's deterministic but unique per user
  const seed = Number(BigInt(id) % 10000n);
  const archetypeSeed = seed % 5;

  const archetypes = [
    {
      name: "The Tryhard", // Gamer focused
      verbs: [
        "Grinding",
        "Speedrunning",
        "Nerfing",
        "Clutching",
        "Farming",
        "Carrying",
        "Min-maxing",
      ],
      adjectives: [
        "ranked",
        "sweaty",
        "cracked",
        "toxic",
        "hardcore",
        "mythic",
        "meta",
      ],
      nouns: [
        "lobbies",
        "boss runs",
        "loot boxes",
        "K/D ratios",
        "elo hell",
        "battle passes",
        "skill issues",
      ],
      locations: [
        "in Bronze 5",
        "on a smurf account",
        "with 0 ping",
        "in the gulag",
        "during scrims",
      ],
      emojis: ["🎮", "🕹️", "💀", "🏆", "🎯"],
      templates: [
        (v: string, a: string, n: string, l: string) => `${v} ${a} ${n} ${l}`,
        (v: string, a: string, n: string, l: string) =>
          `Stuck ${l} but still ${v} ${n}`,
        (v: string, a: string, n: string, l: string) =>
          `${v} for that ${a} loot`,
      ],
    },
    {
      name: "The Coder", // Tech focused
      verbs: [
        "Deploying",
        "Debugging",
        "Compiling",
        "Refactoring",
        "Optimizing",
        "Breaking",
        "Patching",
      ],
      adjectives: [
        "deprecated",
        "recursive",
        "headless",
        "production",
        "legacy",
        "spaghetti",
        "encrypted",
      ],
      nouns: [
        "mainframes",
        "syntax errors",
        "pull requests",
        "edge cases",
        "dependencies",
        "API keys",
        "coffee",
      ],
      locations: [
        "in production",
        "on localhost:3000",
        "in the terminal",
        "at 3AM",
        "without backups",
      ],
      emojis: ["💻", "⌨️", "🐛", "☕", "🔋"],
      templates: [
        (v: string, a: string, n: string, l: string) => `${v} ${a} ${n} ${l}`,
        (v: string, a: string, n: string, l: string) =>
          `Pushing ${a} code ${l}`,
        (v: string, a: string, n: string, l: string) =>
          `${v} ${n} until it works`,
      ],
    },
    {
      name: "The Student", // Relatable/Tired
      verbs: [
        "Procrastinating",
        "Panic-writing",
        "Cramming",
        "Ignoring",
        "Regretting",
        "Surviving",
        "Napping",
      ],
      adjectives: [
        "overdue",
        "caffeinated",
        "last-minute",
        "academic",
        "unpaid",
        "mandatory",
        "sleep-deprived",
      ],
      nouns: [
        "deadlines",
        "assignments",
        "finals",
        "group projects",
        "instant noodles",
        "student loans",
        "alarms",
      ],
      locations: [
        "in the library",
        "during lectures",
        "on a school night",
        "before the 11:59 deadline",
        "in zoom",
      ],
      emojis: ["📚", "💤", "🥡", "✏️", "😭"],
      templates: [
        (v: string, a: string, n: string, l: string) => `${v} ${a} ${n} ${l}`,
        (v: string, a: string, n: string, l: string) =>
          `Currently ${v} ${n} instead of sleeping`,
        (v: string, a: string, n: string, l: string) =>
          `${l} trying to finish these ${n}`,
      ],
    },
    {
      name: "The Shitposter", // Internet/Meme
      verbs: [
        "Doomscrolling",
        "Manifesting",
        "Gatekeeping",
        "Ghosting",
        "Simping",
        "Posting",
        "Lurking",
      ],
      adjectives: [
        "cursed",
        "based",
        "cringe",
        "wholesome",
        "feral",
        "chronically online",
        "unhinged",
      ],
      nouns: [
        "hot takes",
        "vibes",
        "memes",
        "discord kittens",
        "ratio attempts",
        "conspiracy theories",
        "drama",
      ],
      locations: [
        "on main",
        "in DMs",
        "in general chat",
        "on Twitter (X)",
        "under a rock",
      ],
      emojis: ["🤡", "🗿", "💅", "🧢", "💀"],
      templates: [
        (v: string, a: string, n: string, l: string) => `${v} ${a} ${n} ${l}`,
        (v: string, a: string, n: string, l: string) =>
          `Just ${v} ${n} ${l} tbh`,
        (v: string, a: string, n: string, l: string) =>
          `${l} with the ${a} ${n}`,
      ],
    },
    {
      name: "The Vibe", // Chill/Aesthetic
      verbs: [
        "Curating",
        "Rendering",
        "Designing",
        "Streaming",
        "Listening to",
        "Collecting",
        "Exploring",
      ],
      adjectives: [
        "lo-fi",
        "aesthetic",
        "retro",
        "neon",
        "analog",
        "dreamy",
        "nostalgic",
      ],
      nouns: [
        "playlists",
        "visuals",
        "synths",
        "cassettes",
        "pixels",
        "liminal spaces",
        "frequencies",
      ],
      locations: [
        "in the void",
        "at 4AM",
        "on cassette",
        "in reverb",
        "under the stars",
      ],
      emojis: ["✨", "🌊", "🌙", "🎹", "💿"],
      templates: [
        (v: string, a: string, n: string, l: string) => `${v} ${a} ${n} ${l}`,
        (v: string, a: string, n: string, l: string) =>
          `Lost ${l} with ${a} ${n}`,
        (v: string, a: string, n: string, l: string) => `${a} ${n} vibes only`,
      ],
    },
  ];

  const theme = archetypes[archetypeSeed];

  const v = theme.verbs[seed % theme.verbs.length];
  const a = theme.adjectives[(seed * 2) % theme.adjectives.length];
  const n = theme.nouns[(seed * 3) % theme.nouns.length];
  const l = theme.locations[(seed * 4) % theme.locations.length];
  const e = theme.emojis[(seed * 5) % theme.emojis.length];

  const template = theme.templates[seed % theme.templates.length];

  return `${template(v, a, n, l)} ${e}`;
}

function generateClass(id: string, createdAt: number): string {
  const seed = Number(BigInt(id) % 100n) + (createdAt % 10);

  const prefixes = [
    "Cyber",
    "Void",
    "Neon",
    "Data",
    "Techno",
    "Quantum",
    "Holo",
    "Crypto",
    "Neural",
    "Pixel",
  ];
  const roots = [
    "Mancer",
    "Knight",
    "Ninja",
    "Drifter",
    "Architect",
    "Ronin",
    "Broker",
    "Surgeon",
    "Operative",
    "Ghost",
  ];

  const prefix = prefixes[seed % prefixes.length];
  const root = roots[(seed * 7) % roots.length];

  return `${prefix} ${root}`;
}

function calculateRarity(
  flags = 0,
  createdAt: number
): DiscordProfile["rarity"] {
  const now = Date.now();
  const accountAgeYears = (now - createdAt) / (1000 * 60 * 60 * 24 * 365);

  // Flags check (HypeSquad, Verified Dev, etc increase rarity)
  const hasSpecialFlags =
    flags & (1 << 2) || flags & (1 << 17) || flags & (1 << 18); // HypeSquad Events, Verified Bot Dev, Certified Mod

  if (accountAgeYears > 7 || (hasSpecialFlags && accountAgeYears > 4))
    return "MYTHIC";
  if (accountAgeYears > 5 || hasSpecialFlags) return "LEGENDARY";
  if (accountAgeYears > 3 || flags > 0) return "EPIC";
  if (accountAgeYears > 1) return "RARE";
  return "COMMON";
}

function calculatePowerLevel(createdAt: number, id: string): number {
  const baseScore = 1000;
  const ageBonus =
    Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24 * 30)) * 10; // 10 points per month
  const idBonus = Number.parseInt(id.slice(-4)) % 500; // Random bonus from ID
  return baseScore + ageBonus + idBonus;
}

function getElement(color: number | null): string {
  if (!color) return "NEUTRAL";
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;

  if (r > g && r > b) return "PYRO"; // Fire
  if (b > r && b > g) return "HYDRO"; // Water
  if (g > r && g > b) return "DENDRO"; // Nature
  if (r > 200 && g > 200 && b < 100) return "ELECTRO"; // Electric
  if (r > 200 && b > 200) return "PSYCHO"; // Psychic
  return "GEO"; // Earth
}

function generateBanner(
  id: string,
  accentColor: number | null,
  rarity: string
): string {
  const seed = Number(BigInt(id) % 100n);
  const rarityColors: Record<string, string> = {
    COMMON: "#A3A3A3",
    RARE: "#3B82F6",
    EPIC: "#9333EA",
    LEGENDARY: "#EAB308",
    MYTHIC: "#EF4444",
  };

  const rarityColor = rarityColors[rarity] || "#5865F2";
  // Use rarity color as the base for all gradients to ensure "colors match for all"
  const colorHex = rarityColor;

  // 4 Distinct Patterns based on ID
  const patternType = seed % 4;

  if (patternType === 0) {
    // Cyber Grid
    return `
      radial-gradient(circle at 50% 0%, ${rarityColor}40 0%, transparent 70%),
      linear-gradient(0deg, transparent 24%, ${colorHex}20 25%, ${colorHex}20 26%, transparent 27%, transparent 74%, ${colorHex}20 75%, ${colorHex}20 76%, transparent 77%, transparent),
      linear-gradient(90deg, transparent 24%, ${colorHex}20 25%, ${colorHex}20 26%, transparent 27%, transparent 74%, ${colorHex}20 75%, ${colorHex}20 76%, transparent 77%, transparent),
      linear-gradient(135deg, ${colorHex} 0%, #000000 100%)
    `;
  } else if (patternType === 1) {
    // Hexagon Hive (Simulated with radial)
    return `
      radial-gradient(circle at 100% 100%, ${rarityColor}60 0%, transparent 50%),
      radial-gradient(circle at 0% 0%, ${colorHex}60 0%, transparent 50%),
      repeating-linear-gradient(45deg, ${colorHex}10 0px, ${colorHex}10 2px, transparent 2px, transparent 10px),
      linear-gradient(45deg, #1a1a1a 0%, #000000 100%)
    `;
  } else if (patternType === 2) {
    // Digital Waves
    return `
      repeating-radial-gradient(circle at 50% 100%, ${colorHex}20 0, ${colorHex}20 10px, transparent 10px, transparent 20px),
      linear-gradient(to top, ${rarityColor}40, transparent),
      linear-gradient(180deg, #2c2f33 0%, #000000 100%)
    `;
  } else {
    // Abstract Chaos
    return `
      radial-gradient(circle at 30% 20%, ${rarityColor} 0%, transparent 40%),
      radial-gradient(circle at 80% 80%, ${colorHex} 0%, transparent 40%),
      linear-gradient(45deg, #000000 0%, #23272a 100%)
    `;
  }
}

export async function getDiscordProfile(userId: string) {
  try {
    if (!userId) return { error: "User ID is required" };

    let data: any;

    if (!process.env.DISCORD_BOT_TOKEN) {
      // Mock data if no token provided
      console.log("No token found, using mock data");

      // Deterministic mock based on ID
      const isOld = userId.endsWith("0");
      const hasFlags = userId.endsWith("5");

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockDate = isOld ? 1451606400000 : 1672531200000; // 2016 vs 2023

      data = {
        id: userId,
        username: isOld ? "OG_Legend" : "NewChallenger",
        global_name: isOld ? "The Original" : "Rookie",
        avatar: null,
        accent_color: isOld ? 16763904 : 5793266, // Gold or Blurple
        banner_color: null,
        public_flags: hasFlags ? (1 << 8) | (1 << 22) : 1 << 6, // Balance + Active Dev OR Bravery
        created_at: mockDate,
      };
    } else {
      const res = await fetch(`https://discord.com/api/v10/users/${userId}`, {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        const error = await res.json();
        return { error: error.message || "Failed to fetch user" };
      }

      data = await res.json();

      // Calculate creation date from Snowflake ID
      // Discord Epoch: 1420070400000
      const snowflake = BigInt(userId);
      const timestamp = Number((snowflake >> 22n) + 1420070400000n);
      data.created_at = timestamp;
    }

    const validatedData = DiscordProfileSchema.parse(data);

    const rarity = calculateRarity(
      validatedData.public_flags,
      validatedData.created_at
    );
    const powerLevel = calculatePowerLevel(
      validatedData.created_at,
      validatedData.id
    );
    const element = getElement(validatedData.accent_color);

    const classType = generateClass(validatedData.id, validatedData.created_at);

    const badges = getBadges(
      validatedData.public_flags,
      validatedData.created_at
    );
    const bio = generateBio(
      validatedData.id,
      validatedData.username,
      classType,
      rarity
    );

    const banner = generateBanner(
      validatedData.id,
      validatedData.accent_color,
      rarity
    );

    // Fetch GitHub stars
    const repoStars = await getRepoStars("octocat", "Hello-World");

    return {
      ...validatedData,
      rarity,
      powerLevel,
      element,
      classType,
      badges,
      bio,
      joinRank: `#${userId.slice(0, 4)}...`, // Mock rank
      repoStars,
      banner,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { error: "Invalid User ID or Network Error" };
  }
}

export async function getRepoStars(
  owner: string,
  repo: string
): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.stargazers_count;
  } catch (error) {
    console.error("Error fetching repo stars:", error);
    return null;
  }
}
