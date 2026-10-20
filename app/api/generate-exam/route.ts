import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { mode, className, subject, chapter, difficulty, count, language } = await req.json();

    // ==========================================
    // ১. ডাটাবেজ মোড (Database Mode - Smart Match)
    // ==========================================
    if (mode === "DB") {
      const takeCount = parseInt(count) || 20;

      // অধ্যায়ের আগের সংখ্যা বাদ দেওয়া (যেমন: "১. বাস্তব সংখ্যা" -> "বাস্তব সংখ্যা")
      const cleanChapter = chapter
        ? chapter.replace(/^[০-৯\d]+[\.\:\s\-]+/g, "").replace(/^Unit\s+\d+[\:\.\s]+/gi, "").trim()
        : "";

      // ক্লাসের বিকল্প নামগুলো তৈরি করা
      const classKeywords = [className];
      if (className.includes("9-10")) classKeywords.push("SSC", "Class 9", "Class 10", "৯ম", "১০ম");
      if (className.includes("11-12")) classKeywords.push("HSC", "Class 11", "Class 12", "১১শ", "১২শ");
      if (className.includes("6")) classKeywords.push("৬ষ্ঠ");
      if (className.includes("7")) classKeywords.push("৭ম");
      if (className.includes("8")) classKeywords.push("৮ম", "JSC");

      // ১. প্রথম চেষ্টা: ক্লাস + বিষয় + অধ্যায় মিলিয়ে খোঁজা
      let dbQuestions = await db.question.findMany({
        where: {
          OR: classKeywords.map((k) => ({ category: { contains: k, mode: "insensitive" } })),
          subject: { contains: subject, mode: "insensitive" },
          ...(cleanChapter && cleanChapter !== "সম্পূর্ণ বই / সিলেবাস"
            ? {
                OR: [
                  { topic: { contains: cleanChapter, mode: "insensitive" } },
                  { topic: { contains: chapter, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        take: takeCount,
      });

      // ২. দ্বিতীয় চেষ্টা: যদি ক্লাস নাম নিয়ে সমস্যা থাকে, শুধু বিষয় ও অধ্যায় দিয়ে খোঁজা
      if (!dbQuestions || dbQuestions.length === 0) {
        if (cleanChapter && cleanChapter !== "সম্পূর্ণ বই / সিলেবাস") {
          dbQuestions = await db.question.findMany({
            where: {
              subject: { contains: subject, mode: "insensitive" },
              topic: { contains: cleanChapter, mode: "insensitive" },
            },
            take: takeCount,
          });
        }
      }

      // ৩. তৃতীয় চেষ্টা: অধ্যায়ের নাম না মিললে পুরো বিষয়ের যেকোনো প্রশ্ন নেওয়া
      if (!dbQuestions || dbQuestions.length === 0) {
        dbQuestions = await db.question.findMany({
          where: {
            subject: { contains: subject, mode: "insensitive" },
          },
          take: takeCount,
        });
      }

      // ৪. এখনো না পেলে ডাটাবেজের একটি নমুনা দেখিয়ে সাহায্য করা
      if (!dbQuestions || dbQuestions.length === 0) {
        const sample = await db.question.findFirst({
          select: { category: true, subject: true, topic: true },
        });

        const sampleInfo = sample 
          ? `(ডাটাবেজে বর্তমানে Category: "${sample.category}", Subject: "${sample.subject}", Topic: "${sample.topic}" হিসেবে ডেটা আছে)` 
          : "(ডাটাবেজের Question টেবিলে কোনো প্রশ্ন পাওয়া যায়নি)";

        return NextResponse.json({
          success: false,
          error: `ডাটাবেজে "${subject}" বিষয়ের প্রশ্ন মেলানো যায়নি। ${sampleInfo}`,
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
    // ২. AI মোড
    // ==========================================
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Vercel-এ GEMINI_API_KEY পাওয়া যায়নি!" },
        { status: 400 }
      );
    }

    const prompt = `
Generate exactly ${count} multiple choice questions (MCQs) in Bengali.
- Class: ${className}
- Subject: ${subject}
- Chapter/Topic: ${chapter || "সম্পূর্ণ সিলেবাস"}
- Difficulty: ${difficulty}
- Language: ${language || "বাংলা"}

Return a pure JSON array ONLY:
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

    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-3.8-flash"];
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
        { success: false, error: lastError || "AI মডেল ব্যস্ত আছে। আবার চেষ্টা করুন।" },
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
