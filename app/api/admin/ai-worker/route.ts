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

    // ৪. ডাটাবেজে সেভ
    if (task.type === "BLOG") {
      await db.post.create({
        data: {
          title: parsed.title,
          slug: parsed.slug + "-" + Date.now(),
          body: parsed.body,
          tags: parsed.tags,
          category: task.category,
          subject: task.subject,
          topic: task.topic,
          focusKeyword: parsed.focusKeyword,
          keywords: parsed.keywords,
          metaTitle: parsed.metaTitle,
          metaDescription: parsed.metaDescription,
          published: false,
        }
      });
    } else {
      await db.question.createMany({
        data: parsed.questions.map((q: any) => ({
          text: q.text,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation,
          category: task.category,
          subject: task.subject,
          topic: task.topic,
          approved: false,
          source: "AI_GENERATOR"
        }))
      });
    }

    // ৫. কাজ শেষ
    await db.aiTask.update({ where: { id: task.id }, data: { status: "COMPLETED" } });
    
    return new NextResponse("OK", { status: 200 }); 

  } catch (error: any) {
    console.error("Worker Error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}
