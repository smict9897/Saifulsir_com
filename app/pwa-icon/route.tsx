import { ImageResponse } from "next/og";

// অ্যাপ আইকন নিজে নিজে তৈরি হয়: /pwa-icon?size=192 | 512 | 180
export async function GET(req: Request) {
  const raw = Number(new URL(req.url).searchParams.get("size"));
  const size = [180, 192, 512].includes(raw) ? raw : 512;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #27c97a, #12904f)",
          color: "#ffffff",
          fontSize: size * 0.56,
          fontWeight: 700,
        }}
      >
        S
      </div>
    ),
    { width: size, height: size }
  );
}
