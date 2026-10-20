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

    let rawText = "";

    // ১. গুগলের নতুন Interactions API ট্রাই করা (gemini-3.8-flash)
    try {
      const interactionRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/gemini-3.8-flash",
            input: prompt,
            generation_config: {
              response_mime_type: "application/json",
            },
          }),
        }
      );

      const intData = await interactionRes.json();
      
      // Interactions API আউটপুট থেকে টেক্সট নেওয়া
      if (intData?.steps && intData.steps.length > 0) {
        const lastStep = intData.steps[intData.steps.length - 1];
        rawText = lastStep?.output?.text || lastStep?.content?.parts?.[0]?.text || "";
      } else if (intData?.output?.text) {
        rawText = intData.output.text;
      }
    } catch (e) {
      console.log("Interactions API fallback to generateContent...");
    }

    // ২. ফলব্যাক: generateContent মেথডে gemini-3.8-flash
    if (!rawText) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
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
      if (data.error) {
        throw new Error(data.error.message);
      }
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    if (!rawText) {
      return NextResponse.json(
        { success: false, error: "Gemini থেকে প্রশ্ন তৈরি করা যায়নি। আবার চেষ্টা করুন।" },
        { status: 500 }
      );
    }

    // ৩. রেসপন্স ক্লিন ও JSON পার্সিং
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }

    const questions = JSON.parse(cleaned);
    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error("Exam Gen Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "সার্ভার এরর হয়েছে" },
      { status: 500 }
    );
  }
}
