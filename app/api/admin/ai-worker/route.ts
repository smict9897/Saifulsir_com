import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const maxDuration = 60; 
export const dynamic = "force-dynamic";

export async function GET() {
  let currentTaskId = null;

  try {
    const oneMinAgo = new Date(Date.now() - 1 * 60 * 1000);
    await db.aiTask.updateMany({
      where: { status: "PROCESSING", updatedAt: { lt: oneMinAgo } },
      data: { status: "PENDING" }
    });

    const task = await db.aiTask.findFirst({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" }
    });

    if (!task) return new NextResponse("No Task", { status: 200 });

    currentTaskId = task.id;
    await db.aiTask.update({ where: { id: task.id }, data: { status: "PROCESSING" } });

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error("DEEPSEEK_API_KEY সেট করা নেই!");

    let systemPrompt = "";
    const contextText = `Class: ${task.category || "Not specified"}, Subject: ${task.subject || "Not specified"}, Topic: ${task.topic || task.prompt}`;

    if (task.type === "BLOG") {
      // 🎯 পার্ট অনুযায়ী এআই-কে আলাদা নির্দেশনা দেওয়া
      let partInstruction = "";
      if (task.part === 1) {
        partInstruction = `Write Part 1 (approx 700 words): Introduction, basic concepts, and types of the topic. Include an attractive SEO-friendly title, slug, and meta details.`;
      } else if (task.part === 2) {
        partInstruction = `Write Part 2 (approx 700 words): Detailed techniques, formulas, and step-by-step examples. Start directly with <h2> heading. Do NOT include the title or introduction again.`;
      } else {
        partInstruction = `Write Part 3 (approx 600 words): Common mistakes, practice problems with solutions, and a conclusion. Start directly with <h2> heading. Do NOT include the title or introduction again.`;
      }

      systemPrompt = `You are an expert Bengali blogger. Write a detailed blog post for: "${contextText}". ${partInstruction} Return ONLY a valid JSON object: { "title": "...", "slug": "...", "body": "<h2>...</h2><p>...</p>", "tags": "tag1, tag2", "focusKeyword": "...", "keywords": "kw1, kw2", "metaTitle": "...", "metaDescription": "..." }`;
    } else {
      systemPrompt = `You are an expert Bengali teacher. Generate exactly 10 high-quality MCQs for: "${contextText}". Return ONLY a valid JSON object: { "questions": [ { "text": "প্রশ্ন", "options": { "A": "ক", "B": "খ", "C": "গ", "D": "ঘ" }, "correct": "A", "explanation": "ব্যাখ্যা" } ] }`;
    }

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

    if (!res.ok) throw new Error(`DeepSeek API Error: ${await res.text()}`);

    const data = await res.json();
    let content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI থেকে কোনো উত্তর পাওয়া যায়নি।");

    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(content);

    let categoryId = null;
    if (task.category) {
      const existingCategory = await db.category.findFirst({ where: { name: task.category } });
      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const newCategory = await db.category.create({
          data: { name: task.category, slug: task.category.toLowerCase().replace(/\s+/g, '-') + "-" + Date.now() }
        });
        categoryId = newCategory.id;
      }
    }

    if (task.type === "BLOG") {
      const tagsArray = typeof parsed.tags === 'string' ? parsed.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
      const keywordsArray = typeof parsed.keywords === 'string' ? parsed.keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [];

      let savedPostId = task.postId;

      // 🎯 পার্ট ১ হলে নতুন পোস্ট তৈরি হবে
      if (task.part === 1) {
        const newPost = await db.post.create({
          data: {
            title: parsed.title,
            slug: parsed.slug + "-" + Date.now(),
            body: parsed.body,
            tags: tagsArray, 
            keywords: keywordsArray, 
            categoryId: categoryId, 
            focusKeyword: parsed.focusKeyword,
            metaTitle: parsed.metaTitle,
            metaDescription: parsed.metaDescription,
            published: false,
          }
        });
        savedPostId = newPost.id;

        // 🎯 পরবর্তী পার্টগুলোকে এই পোস্টের আইডি দিয়ে দেওয়া হবে
        if (task.batchId) {
          await db.aiTask.updateMany({
            where: { batchId: task.batchId, status: "PENDING" },
            data: { postId: savedPostId }
          });
        }
      } 
      // 🎯 পার্ট ২ বা ৩ হলে আগের পোস্টের সাথে নতুন অংশ জোড়া লাগানো হবে
      else if (savedPostId) {
        const existingPost = await db.post.findUnique({ where: { id: savedPostId } });
        if (existingPost) {
          await db.post.update({
            where: { id: savedPostId },
            data: { body: existingPost.body + "\n" + parsed.body }
          });
        }
      }
    } else {
      await (db.question.createMany as any)({
        data: parsed.questions.map((q: any) => ({
          text: q.text, options: q.options, correct: q.correct, explanation: q.explanation,
          category: task.category || null, subject: task.subject || null, topic: task.topic || null,
          difficulty: "MEDIUM", approved: false, source: "AI_GENERATOR"
        }))
      });
    }

    await db.aiTask.update({ where: { id: task.id }, data: { status: "COMPLETED" } });
    return new NextResponse("সফলভাবে কাজ সম্পন্ন হয়েছে!", { status: 200 }); 

  } catch (error: any) {
    console.error("Worker Error:", error.message);
    if (currentTaskId) {
      await db.aiTask.update({ where: { id: currentTaskId }, data: { status: "FAILED" } }).catch(() => {});
    }
    return new NextResponse(`Error: ${error.message}`, { status: 500 }); 
  }
}
