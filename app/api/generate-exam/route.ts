import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function extractOptions(rawOptions: any): string[] {
  if (!rawOptions) return [];
  let data = rawOptions;
  if (typeof data === "string") {
    try { data = JSON.parse(data); } catch {
      const lines = data.split(/\n/).map((s: string) => s.trim()).filter(Boolean);
      if (lines.length >= 2) return lines;
    }
  }
  if (Array.isArray(data)) {
    return data.map((item: any) => {
      if (typeof item === "string") return item.trim();
      if (typeof item === "object" && item !== null) return String(item.text || item.option || item.value || item.title || Object.values(item)[0] || "").trim();
      return String(item).trim();
    }).filter(Boolean);
  }
  if (typeof data === "object" && data !== null) {
    if (Array.isArray(data.options)) return extractOptions(data.options);
    const keys = Object.keys(data);
    const preferredOrder = ["ক", "খ", "গ", "ঘ", "A", "B", "C", "D", "a", "b", "c", "d", "১", "২", "৩", "৪", "1", "2", "3", "4", "0", "1", "2", "3"];
    const sortedKeys = [...keys].sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
    const values = sortedKeys.map((k) => {
      const val = data[k];
      if (typeof val === "string") return val.trim();
      if (typeof val === "object" && val !== null) return String(val.text || val.value || Object.values(val)[0] || "").trim();
      return String(val || "").trim();
    }).filter(Boolean);
    if (values.length > 0) return values;
  }
  return [];
}

export async function POST(req: Request) {
  try {
    const { mode, type, questionType, className, subject, chapter, difficulty, count, language } = await req.json();

    // ১. ডাটাবেজ মোড (DB)
    if (mode === "DB") {
      const takeCount = parseInt(count) || 20;
      const cleanChapter = chapter ? chapter.replace(/^[০-৯\d]+[\.\:\s\-]+/g, "").replace(/^Unit\s+\d+[\:\.\s]+/gi, "").trim() : "";
      const classKeywords = [className];
      if (className.includes("9-10")) classKeywords.push("SSC", "Class 9", "Class 10", "৯ম", "১০ম");
      if (className.includes("11-12")) classKeywords.push("HSC", "Class 11", "Class 12", "১১শ", "১২শ");

      let dbQuestions = await db.question.findMany({
        where: {
          OR: classKeywords.map((k) => ({ category: { contains: k, mode: "insensitive" } })),
          subject: { contains: subject, mode: "insensitive" },
          ...(cleanChapter && cleanChapter !== "সম্পূর্ণ বই / সিলেবাস" ? { OR: [{ topic: { contains: cleanChapter, mode: "insensitive" } }, { topic: { contains: chapter, mode: "insensitive" } }] } : {}),
        },
        take: takeCount,
      });

      if (!dbQuestions || dbQuestions.length === 0) {
        dbQuestions = await db.question.findMany({ where: { subject: { contains: subject, mode: "insensitive" } }, take: takeCount });
      }
      if (!dbQuestions || dbQuestions.length === 0) return NextResponse.json({ success: false, error: `ডাটাবেজে "${subject}" বিষয়ের প্রশ্ন নেই।` });

      const letterMap: Record<string, number> = { "ক": 0, "খ": 1, "গ": 2, "ঘ": 3, "A": 0, "B": 1, "C": 2, "D": 3, "a": 0, "b": 1, "c": 2, "d": 3, "১": 0, "২": 1, "৩": 2, "৪": 3, "0": 0, "1": 1, "2": 2, "3": 3 };

      const formatted = dbQuestions.map((q, idx) => {
        const opts = extractOptions(q.options);
        let correctIdx = 0;
        const correctStr = String(q.correct || "").trim();
        if (letterMap[correctStr] !== undefined) correctIdx = letterMap[correctStr];
        else if (!isNaN(Number(correctStr))) correctIdx = parseInt(correctStr);
        return { id: q.id || idx + 1, type: "MCQ", question: q.text, options: opts.length > 0 ? opts : ["অপশন ১", "অপশন ২", "অপশন ৩", "অপশন ৪"], correctAnswer: correctIdx, explanation: q.explanation || "ব্যাখ্যা নেই।" };
      });
      return NextResponse.json({ success: true, questions: formatted, source: "DB" });
    }

    // ২. AI মোড (DeepSeek)
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return NextResponse.json({ success: false, error: "DEEPSEEK_API_KEY নেই!" }, { status: 400 });

    const totalCount = parseInt(count) || 10;
    const reqType = questionType || type || "MCQ";
    let prompt = "";

    if (reqType === "EXAM" || reqType === "MCQ") {
      prompt = `Generate exactly ${totalCount} Multiple Choice Questions (MCQs) in Bengali based on Class: ${className}, Subject: ${subject}, Chapter: ${chapter || "সম্পূর্ণ বই"}, Difficulty: ${difficulty}. Return JSON: { "questions": [{ "type": "MCQ", "question": "প্রশ্ন", "options": ["ক", "খ", "গ", "ঘ"], "correctAnswer": 0, "explanation": "ব্যাখ্যা" }] }`;
    } else if (reqType === "SHORT") {
      prompt = `Generate exactly ${totalCount} Short Questions (সংক্ষিপ্ত প্রশ্ন) in Bengali based on Class: ${className}, Subject: ${subject}, Chapter: ${chapter || "সম্পূর্ণ বই"}. Return JSON: { "questions": [{ "type": "SHORT", "question": "প্রশ্ন", "answer": "উত্তর" }] }`;
    } else if (reqType === "CQ") {
      prompt = `Generate exactly ${totalCount} Creative Questions (সৃজনশীল) in Bengali based on Class: ${className}, Subject: ${subject}, Chapter: ${chapter || "সম্পূর্ণ বই"}. Return JSON: { "questions": [{ "type": "CQ", "stimulus": "উদ্দীপক", "subQuestions": { "k": "ক", "kh": "খ", "g": "গ", "gh": "ঘ" } }] }`;
    } else {
      const mcqCount = Math.ceil(totalCount * 0.5);
      const shortCount = Math.floor(totalCount * 0.25);
      const cqCount = Math.floor(totalCount * 0.25);
      prompt = `Generate a mixed paper in Bengali: ${mcqCount} MCQ, ${shortCount} Short, ${cqCount} CQ based on Class: ${className}, Subject: ${subject}, Chapter: ${chapter || "সম্পূর্ণ বই"}. Return JSON: { "questions": [{ "type": "MCQ", "question": "প্রশ্ন", "options": ["ক", "খ", "গ", "ঘ"], "correctAnswer": 0, "explanation": "ব্যাখ্যা" }, { "type": "SHORT", "question": "প্রশ্ন", "answer": "উত্তর" }, { "type": "CQ", "stimulus": "উদ্দীপক", "subQuestions": { "k": "ক", "kh": "খ", "g": "গ", "gh": "ঘ" } }] }`;
    }

    const deepseekRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: "You are a Bengali exam generator. Output only valid JSON." }, { role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!deepseekRes.ok) return NextResponse.json({ success: false, error: `DeepSeek API Error: ${deepseekRes.status}` }, { status: 500 });
    const data = await deepseekRes.json();
    let rawText = data?.choices?.[0]?.message?.content;

    if (!rawText) return NextResponse.json({ success: false, error: "AI থেকে রেসপন্স পাওয়া যায়নি।" }, { status: 500 });

    let cleaned = rawText.trim();
    if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    const parsed = JSON.parse(cleaned);
    return NextResponse.json({ success: true, questions: parsed.questions || parsed, source: "DeepSeek" });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "সার্ভার এরর" }, { status: 500 });
  }
}
