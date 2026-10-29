import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const maxDuration = 60; 
export const dynamic = "force-dynamic";

export async function GET() {
  let currentTaskId = null;

  try {
    // ১. আটকে থাকা টাস্ক রিসেট
    const oneMinAgo = new Date(Date.now() - 1 * 60 * 1000);
    await db.aiTask.updateMany({
      where: { status: "PROCESSING", updatedAt: { lt: oneMinAgo } },
      data: { status: "PENDING" }
    });

    // ২. নতুন টাস্ক খোঁজা
    const task = await db.aiTask.findFirst({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" }
    });

    if (!task) return new NextResponse("No Task", { status: 200 });

    // ৩. প্রসেসিং শুরু
    currentTaskId = task.id;
    await db.aiTask.update({ where: { id: task.id }, data: { status: "PROCESSING" } });

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error("DEEPSEEK_API_KEY সেট করা নেই!");

    let systemPrompt = "";
    const contextText = `Class: ${task.category || "Not specified"}, Subject: ${task.subject || "Not specified"}, Topic: ${task.topic || task.prompt}`;

    if (task.type === "BLOG") {
      systemPrompt = `You are an expert Bengali blogger. Write a detailed blog post (around 500-800 words) for: "${contextText}". Return ONLY a valid JSON object: { "title": "...", "slug": "...", "body": "<h2>...</h2><p>...</p>", "tags": "tag1, tag2, tag3", "focusKeyword": "...", "keywords": "kw1, kw2, kw3", "metaTitle": "...", "metaDescription": "..." }`;
    } else {
      systemPrompt = `You are an expert Bengali teacher. Generate exactly 10 high-quality MCQs for: "${contextText}". Return ONLY a valid JSON object: { "questions": [ { "text": "প্রশ্ন", "options": { "A": "ক", "B": "খ", "C": "গ", "D": "ঘ" }, "correct": "A", "explanation": "ব্যাখ্যা" } ] }`;
    }

    // ৪. ৪৫ সেকেন্ডের টাইমআউট কন্ট্রোলার
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); 

    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: "Output ONLY valid JSON." }, { role: "user", content: systemPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const apiError = await res.text();
      throw new Error(`DeepSeek API Error: ${apiError}`);
    }

    const data = await res.json();
    let content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI থেকে কোনো উত্তর পাওয়া যায়নি।");

    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(content);

    // ৫. ক্যাটাগরি চেক
    let categoryId = null;
    if (task.category) {
      const existingCategory = await db.category.findFirst({ where: { name: task.category } });
      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const newCategory = await db.category.create({
          data: { 
            name: task.category,
            slug: task.category.toLowerCase().replace(/\s+/g, '-') + "-" + Date.now()
          }
        });
        categoryId = newCategory.id;
      }
    }

    // 🎯 ৬. ডাটাবেজে সেভ করা (tags ও keywords উভয়কে Array-তে কনভার্ট করে)
    if (task.type === "BLOG") {
      const tagsArray = typeof parsed.tags === 'string' 
        ? parsed.tags.split(',').map((t: string) => t.trim()).filter(Boolean) 
        : [];

      // 🎯 keywords-কেও অ্যারেতে কনভার্ট করা হলো
      const keywordsArray = typeof parsed.keywords === 'string'
        ? parsed.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
        : [];

      await db.post.create({
        data: {
          title: parsed.title,
          slug: parsed.slug + "-" + Date.now(),
          body: parsed.body,
          tags: tagsArray, 
          keywords: keywordsArray, // 🎯 এখানে অ্যারে পাঠানো হলো
          categoryId: categoryId, 
          focusKeyword: parsed.focusKeyword,
          metaTitle: parsed.metaTitle,
          metaDescription: parsed.metaDescription,
          published: false,
        }
      });
    } else {
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

    await db.aiTask.update({ where: { id: task.id }, data: { status: "COMPLETED" } });
    return new NextResponse("সফলভাবে কাজ সম্পন্ন হয়েছে!", { status: 200 }); 

  } catch (error: any) {
    console.error("Worker Error:", error.message);
    
    if (currentTaskId) {
      await db.aiTask.update({ 
        where: { id: currentTaskId }, 
        data: { status: "FAILED" } 
      }).catch(() => {});
    }
    
    return new NextResponse(`Error: ${error.message}`, { status: 500 }); 
  }
}
