import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    // 🎯 চেক করা হচ্ছে ইউজার অ্যাডমিন কি না
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Only admins can edit." }, { status: 403 });
    }

    const { id, score } = await req.json();
    if (!id || score === undefined) {
      return NextResponse.json({ success: false, error: "Missing data." }, { status: 400 });
    }

    // 🎯 ডাটাবেজে মার্কস আপডেট করা হচ্ছে (আপনার Prisma Schema অনুযায়ী টেবিলের নাম দিন)
    // উদাহরণস্বরূপ: db.leaderboard.update
    await db.leaderboard.update({
      where: { id },
      data: { score: Number(score) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Leaderboard Edit Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
