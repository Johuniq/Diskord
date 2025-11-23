import { ImageResponse } from "next/og"
import { getDiscordProfile } from "@/app/actions"

export const runtime = "edge"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage: "radial-gradient(circle at 50% 50%, #5865F2 0%, #000000 50%)",
          fontFamily: "sans-serif",
        }}
      >
        <h1 style={{ fontSize: 80, fontWeight: "bold", color: "white", margin: 0 }}>DISKORD LEGENDS</h1>
        <p style={{ fontSize: 30, color: "#aaaaaa", marginTop: 20 }}>Generate your holographic trading card</p>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  }

  const profile = await getDiscordProfile(id)

  if ("error" in profile) {
    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a1a1a",
          color: "white",
        }}
      >
        <h1>User Not Found</h1>
      </div>,
      { width: 1200, height: 630 },
    )
  }

  // Colors based on rarity
  const rarityColors = {
    COMMON: "#a1a1aa",
    RARE: "#3b82f6",
    EPIC: "#a855f7",
    LEGENDARY: "#eab308",
    MYTHIC: "#ef4444",
  }

  const rarityColor = rarityColors[profile.rarity] || "#a1a1aa"

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        backgroundColor: "#09090b",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `linear-gradient(to bottom right, ${rarityColor}40, #000000)`,
          opacity: 0.8,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "60px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Left Side: Text Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "60%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "rgba(255,255,255,0.1)",
              padding: "8px 16px",
              borderRadius: "50px",
              alignSelf: "flex-start",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: rarityColor,
              }}
            />
            <span style={{ color: "white", fontSize: "20px", fontWeight: "bold", letterSpacing: "1px" }}>
              {profile.rarity}
            </span>
          </div>

          <h1 style={{ fontSize: "80px", fontWeight: "900", color: "white", margin: 0, lineHeight: 1 }}>
            {profile.global_name || profile.username}
          </h1>
          <p style={{ fontSize: "32px", color: "#a1a1aa", margin: 0 }}>@{profile.username}</p>

          <div style={{ display: "flex", gap: "40px", marginTop: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "18px", color: "#71717a", textTransform: "uppercase" }}>Class</span>
              <span style={{ fontSize: "32px", color: "white", fontWeight: "bold" }}>{profile.classType}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "18px", color: "#71717a", textTransform: "uppercase" }}>Power Level</span>
              <span style={{ fontSize: "32px", color: rarityColor, fontWeight: "bold" }}>
                {profile.powerLevel.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Avatar */}
        <div
          style={{
            display: "flex",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            border: `8px solid ${rarityColor}`,
            overflow: "hidden",
            boxShadow: `0 0 60px ${rarityColor}60`,
          }}
        >
          {/* Using a proxy or default avatar if null */}
          <img
            src={profile.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
            alt={profile.username}
            width="300"
            height="300"
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Footer Branding */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: "60px",
          fontSize: "24px",
          color: "rgba(255,255,255,0.4)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span>GENERATED BY DISKORD LEGENDS</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
