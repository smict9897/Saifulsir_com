import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { className, subject, chapter, difficulty, count, language } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Vercel-এ GEMINI_API_KEY পাওয়া যায়নি! দয়া করে Environment Variables চেক করুন।" },
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
Note: "correctAnswer" must be integer index (0, 1, 2, or 3).
`;

    // গুগলের বর্তমান অ্যাক্টিভ মডেলগুলোর তালিকা (অটো-ফলব্যাক)
    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-001"
    ];

    let rawText = "";
    let lastError = "";

    // যে মডেলটি পাওয়া যাবে সেটি দিয়ে সরাসরি প্রশ্ন তৈরি করবে
    for (const model of candidateModels) {
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
          continue; // এই মডেল না পেলে পরের মডেলে ট্রাই করবে
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          rawText = text;
          break; // সফলভাবে উত্তর পাওয়া গেছে
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    if (!rawText) {
      return NextResponse.json(
        { success: false, error: lastError || "Gemini থেকে প্রশ্ন পাওয়া যায়নি।" },
        { status: 500 }
      );
    }

    // ব্যাকটিক (```json) থাকলে ক্লিন করা
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }

    const questions = JSON.parse(cleaned);
    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error("Exam Gen Catch Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "সার্ভার এরর হয়েছে" },
      { status: 500 }
    );
  }
}
