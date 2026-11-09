import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { trackVisit } from "@/lib/visitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // ১. কোন পেজে হিট হলো সেটা নিই
    const body = await req.json().catch(() => ({}));
    const path = body.path || "/";

    // ২. ইউজারের IP আর User-Agent বের করি (Vercel-এ forwarded header থাকে)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
               req.headers.get("x-real-ip") || 
               "unknown";
    const ua = req.headers.get("user-agent") || "unknown";
    const country = req.headers.get("x-vercel-ip-country") || "";

    // ৩. সাধারণ বট ফিল্টার (search engine, স্ক্রলার ইত্যাদি বাদ)
    const botKeywords = ["bot", "crawler", "spider", "crawler", "slurp", "facebookexternalhit", "vercel-screenshot"];
    const isBot = botKeywords.some(k => ua.toLowerCase().includes(k));
    if (isBot) {
      return NextResponse.json({ ok: true, skipped: "bot" });
    }

    // ৪. IP ও UA-কে hash করি যাতে raw ডেটা না থাকে
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);
    const uaHash = createHash("sha256").update(ua).digest("hex").slice(0, 16);

    // ৫. ডাটাবেসে লগ করি
    await trackVisit({ path, ipHash, uaHash, country });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("track route failed:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
