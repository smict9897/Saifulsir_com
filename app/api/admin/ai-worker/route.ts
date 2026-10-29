import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const maxDuration = 60; 
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ১. আটকে থাকা টাস্ক রিসেট
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    await db.aiTask.updateMany({
      where: { status: "PROCESSING", updatedAt: { lt: fiveMinsAgo } },
      data: { status: "PENDING" }
    });

    // ২. নতুন টাস্ক খোঁজা
    const task = await db.aiTask.findFirst({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" }
    });

    if (!task) return new NextResponse("No Task", { status: 200 });

    // ৩. প্রসেসিং শুরু
    await db.aiTask.update({ where: { id: task.id }, data: { status: "PROCESSING" } });

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error("API Key Missing");

    let systemPrompt = "";
    const contextText = `Class: ${task.category || "Not specified"}, Subject: ${task.subject || "Not specified"}, Topic: ${task.topic || task.prompt}`;

    if (task.type === "BLOG") {
      systemPrompt = `You are an expert Bengali blogger. Write a detailed 2000-word blog post for: "${contextText}". Return ONLY a valid JSON object: { "title": "...", "slug": "...", "body": "<h2>...</h2><p>...</p>", "tags": "...", "focusKeyword": "...", "keywords": "...", "metaTitle": "...", "metaDescription": "..." }`;
    } else {
      systemPrompt = `You are an expert Bengali teacher. Generate exactly 10 high-quality MCQs for: "${contextText}". Return ONLY a valid JSON object: { "questions": [ { "text": "প্রশ্ন", "options": { "A": "ক", "B": "খ", "C": "গ", "D": "ঘ" }, "correct": "A", "explanation": "ব্যাখ্যা" } ] }`;
    }

    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: "Output ONLY valid JSON." }, { role: "user", content: systemPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 8000
      }),
    });

    if (!res.ok) throw new Error("AI API Error");

    const data = await res.json();
    let content = data?.choices?.[0]?.message?.content;
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(content);

    // 🎯 ৪. ডাটাবেজে সেভ করার আগে ক্যাটাগরি চেক করা
    let categoryId = null;
    if (task.category) {
      const existingCategory = await db.category.findFirst({
        where: { name: task.category }
      });
      
      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        try {
          const newCategory = await db.category.create({
            data: { 
              name: task.category,
              slug: task.category.toLowerCase().replace(/\s+/g, '-') + "-" + Date.now()
            }
          });
          categoryId = newCategory.id;
        } catch (err) {
          console.error("Category create failed:", err);
        }
      }
    }

    if (task.type === "BLOG") {
      // 🎯 ৫. আপনার Post মডেলে যে ফিল্ডগুলো আছে শুধু সেগুলোই পাঠানো হলো
      await db.post.create({
        data: {
          title: parsed.title,
          slug: parsed.slug + "-" + Date.now(),
          body: parsed.body,
          tags: parsed.tags,
          categoryId: categoryId, 
          focusKeyword: parsed.focusKeyword,
          keywords: parsed.keywords,
          metaTitle: parsed.metaTitle,
          metaDescription: parsed.metaDescription,
          published: false,
        }
      });
    } else {
      // 🎯 ৬. প্রশ্ন তৈরির ক্ষেত্রে (যদি subject/topic ফিল্ড থাকে)
      await (db.question.createMany as any)({
        data: parsed.questions.map((q: any) => ({
          text: q.text,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation,
          category: task.category || null,
          subject: task.subject || null,
          topic: task.topic || null,
          approved: false,
          source: "AI_GENERATOR"
        }))
      });
    }

    // ৭. কাজ শেষ
    await db.aiTask.update({ where: { id: task.id }, data: { status: "COMPLETED" } });
    
    return new NextResponse("OK", { status: 200 }); 

  } catch (error: any) {
    console.error("Worker Error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}
