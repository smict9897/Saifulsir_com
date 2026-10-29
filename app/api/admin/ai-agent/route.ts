import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { prompt, type, category, subject, topics } = await req.json();
    
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ success: false, error: "কোনো অধ্যায় সিলেক্ট করা হয়নি।" }, { status: 400 });
    }

    const tasksData: any[] = [];

    // 🎯 প্রতিটি অধ্যায়ের জন্য ৩টি করে টাস্ক (পার্ট) তৈরি করা
    topics.forEach((topic: string) => {
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // পার্ট ১, পার্ট ২, পার্ট ৩
      for (let p = 1; p <= 3; p++) {
        tasksData.push({
          prompt: prompt ? `${prompt} (অধ্যায়: ${topic})` : `ক্লাস: ${category}, বিষয়: ${subject}, অধ্যায়: ${topic}`,
          type: type || "BLOG",
          category: category || null,
          subject: subject || null,
          topic: topic || null,
          status: "PENDING",
          part: p,
          totalParts: 3,
          batchId: batchId
        });
      }
    });

    await db.aiTask.createMany({
      data: tasksData
    });

    return NextResponse.json({ success: true, message: `${topics.length} টি অধ্যায়ের মোট ${tasksData.length} টি কাজ (৩ পার্টে) লাইনে যোগ হয়েছে!` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
