import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Only admins can delete." }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "Missing ID." }, { status: 400 });

    // 🎯 আপনার ডাটাবেজ টেবিলের নাম অনুযায়ী এটি পরিবর্তন করুন (যেমন: db.leaderboard বা db.examResult)
    await db.leaderboard.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Leaderboard Delete Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
