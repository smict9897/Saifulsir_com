import { NextResponse } from "next/server";

// ⚡ Vercel Serverless Timeout ৬০ সেকেন্ড পর্যন্ত বাড়িয়ে দেওয়া হলো
export const maxDuration = 60; 
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { className, subject, chapter, difficulty, count, language } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY সেট করা নেই!" }, { status: 500 });
    }

    const prompt = `
You are an expert question setter for Bangladeshi schools and competitive exams.
Generate ${count} multiple choice questions (MCQs) in Bengali.
- Class/Level: ${className}
- Subject: ${subject}
- Chapter/Topic: ${chapter || "সম্পূর্ণ সিলেবাস"}
- Difficulty: ${difficulty}
- Language: ${language || "বাংলা"}

Return STRICT JSON array ONLY (no markdown text, no backticks, no comments) following this exact schema:
[
  {
    "id": 1,
    "question": "প্রশ্নের টেক্সট বাংলায়",
    "options": ["অপশন ক", "অপশন খ", "অপশন গ", "অপশন ঘ"],
    "correctAnswer": 0,
    "explanation": "সঠিক উত্তরের সহজ ও সুন্দর ব্যাখ্যা"
  }
]
Note: "correctAnswer" must be integer index (0, 1, 2, or 3).
`;

    // gemini-2.5-flash মডেল ব্যবহার করায় এটি মাত্র ৩-৫ সেকেন্ডের মধ্যে উত্তর তৈরি করবে
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Gemini থেকে সঠিক উত্তর আসেনি");
    }

    const questions = JSON.parse(rawText);
    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error("Exam Gen Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
