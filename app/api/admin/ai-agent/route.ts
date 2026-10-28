import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { prompt, type, category, subject, topics } = await req.json();
    
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ success: false, error: "কোনো অধ্যায় সিলেক্ট করা হয়নি।" }, { status: 400 });
    }

    // 🎯 একাধিক টাস্ক তৈরি করা (প্রতিটি অধ্যায়ের জন্য একটি)
    const tasksData = topics.map((topic: string) => ({
      prompt: prompt ? `${prompt} (অধ্যায়: ${topic})` : `ক্লাস: ${category}, বিষয়: ${subject}, অধ্যায়: ${topic}`,
      type: type || "BLOG",
      category: category || null,
      subject: subject || null,
      topic: topic || null,
      status: "PENDING"
    }));

    await db.aiTask.createMany({
      data: tasksData
    });

    return NextResponse.json({ success: true, message: `${topics.length} টি কাজ সফলভাবে লাইনে যোগ হয়েছে!` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
