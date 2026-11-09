import { NextResponse } from "next/server";
import { getVisitorStats } from "@/lib/visitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getVisitorStats();
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (e) {
    console.error("visitor-stats route failed:", e);
    return NextResponse.json(
      { total: 0, today: 0, week: 0, month: 0, year: 0, ok: false },
      { status: 500 }
    );
  }
}
