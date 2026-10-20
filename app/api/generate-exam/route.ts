import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { mode, className, subject, chapter, difficulty, count, language } = await req.json();

    // ==========================================
    // ১. ডাটাবেজ মোড (Database Mode - Instant)
    // ==========================================
    if (mode === "DB") {
      // ডাটাবেজ থেকে শর্ত অনুযায়ী প্রশ্ন খোঁজা
      const dbQuestions = await db.question.findMany({
        where: {
          category: { contains: className, mode: "insensitive" },
          subject: { contains: subject, mode: "insensitive" },
          ...(chapter && chapter !== "সম্পূর্ণ বই / সিলেবাস"
            ? { topic: { contains: chapter, mode: "insensitive" } }
            : {}),
        },
        take: parseInt(count) || 20,
      });

      // ডাটাবেজে প্রশ্ন না থাকলে
      if (!dbQuestions || dbQuestions.length === 0) {
        return NextResponse.json({
          success: false,
          error: "ডাটাবেজে এই অধ্যায়ের কোনো প্রশ্ন পাওয়া যায়নি। দয়া করে উপরে 'AI দিয়ে পরীক্ষা' মোডটি সিলেক্ট করুন।",
        });
      }

      // Live MCQ ফরম্যাটে রূপান্তর
      const formatted = dbQuestions.map((q, idx) => {
        let opts: string[] = [];
        try {
          opts = Array.isArray(q.options) ? (q.options as string[]) : JSON.parse(q.options as string);
        } catch {
          opts = ["ক", "খ", "গ", "ঘ"];
        }

        // সঠিক উত্তরের ইন্ডেক্স নির্ধারণ
        let correctIdx = 0;
        if (!isNaN(Number(q.correct))) {
          correctIdx = parseInt(q.correct);
        } else {
          const found = opts.findIndex((o) => o === q.correct);
          correctIdx = found !== -1 ? found : 0;
        }

        return {
          id: q.id || idx + 1,
          question: q.text,
          options: opts,
          correctAnswer: correctIdx,
          explanation: q.explanation || "ব্যাখ্যা উপলব্ধ নেই।",
        };
      });

      return NextResponse.json({ success: true, questions: formatted, source: "DB" });
    }

    // ==========================================
    // ২. AI মোড (Gemini AI Mode)
    // ==========================================
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Vercel-এ GEMINI_API_KEY পাওয়া যায়নি!" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert question setter for Bangladeshi schools and exams.
Generate exactly ${count} multiple choice questions (MCQs) in Bengali.
- Class: ${className}
- Subject: ${subject}
- Chapter/Topic: ${chapter || "সম্পূর্ণ সিলেবাস"}
- Difficulty: ${difficulty}
- Language: ${language || "বাংলা"}

Return a pure JSON array ONLY (no markdown code blocks, no backticks, no introduction, no explanation outside JSON).
JSON Format:
[
  {
    "id": 1,
    "question": "প্রশ্নের টেক্সট বাংলায়",
    "options": ["অপশন ক", "অপশন খ", "অপশন গ", "অপশন ঘ"],
    "correctAnswer": 0,
    "explanation": "সঠিক উত্তরের ব্যাখ্যা"
  }
]
`;

    // গুগলের একাধিক মডেল ব্যাকআপ লিস্ট (High demand এড়াানোর জন্য)
    const models = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-3.8-flash",
      "gemini-1.5-pro",
    ];

    let rawText = "";
    let lastError = "";

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        const data = await response.json();
        if (data.error) {
          lastError = data.error.message;
          continue;
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          rawText = text;
          break;
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    if (!rawText) {
      return NextResponse.json(
        { success: false, error: lastError || "Google সার্ভার ব্যস্ত আছে। দয়া করে 'ডাটাবেজ থেকে পরীক্ষা' মোডটি ব্যবহার করুন।" },
        { status: 500 }
      );
    }

    let cleaned = rawText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }

    const questions = JSON.parse(cleaned);
    return NextResponse.json({ success: true, questions, source: "AI" });
  } catch (error: any) {
    console.error("Exam Route Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "সার্ভার এরর হয়েছে" },
      { status: 500 }
    );
  }
}
