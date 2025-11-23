import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import type React from "react";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Diskord Legends | Holographic Profile Generator",
    template: "%s | Diskord Legends",
  },
  description:
    "Generate your holographic Trading Card based on your Discord account age and flags. Discover your rarity, power level, and RPG class in the Diskord Legends universe.",
  keywords: [
    "Discord",
    "Profile Card",
    "Generator",
    "Trading Card",
    "Gacha",
    "RPG",
    "Holographic",
    "Discord Tools",
    "Developer",
  ],
  authors: [{ name: "Johuniq", url: "https://github.com/Johuniq" }],
  creator: "Johuniq",
  publisher: "Johuniq",
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://diskord-card.vercel.app"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://diskord-legends.vercel.app",
    title: "Diskord Legends | Holographic Profile Generator",
    description:
      "Generate your holographic Trading Card based on your Discord account age and flags. Discover your rarity, power level, and RPG class.",
    siteName: "Diskord Legends",
    images: [
      {
        url: "/og-image.png", // Assuming an OG image exists or will be added
        width: 1200,
        height: 630,
        alt: "Diskord Legends Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Diskord Legends | Holographic Profile Generator",
    description:
      "Generate your holographic Trading Card based on your Discord account age and flags. Discover your rarity, power level, and RPG class.",
    creator: "@johuniq",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${ibmPlexMono.variable} font-mono antialiased`}>
        {children}
      </body>
    </html>
  );
}
