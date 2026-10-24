import { NextResponse } from "next/server";
import { staff } from "@/lib/guard";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await staff();

    const body = await req.json();
    const rawText = String(body.text || "").trim();
    const mode = (body.mode || "AUTO") as "AUTO" | "MCQ" | "SHORT" | "CQ";

    if (!rawText) {
      return NextResponse.json({ ok: false, error: "কোনো টেক্সট পাওয়া যায়নি।" }, { status: 422 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "❌ DEEPSEEK_API_KEY পাওয়া যায়নি! Vercel-এ সেট করুন।" }, { status: 400 });
    }

    try {
      const prompt = `
You are an expert Bengali educational digitizer. 
The following text is from a PDF with broken Bengali fonts. Fix the text and extract questions as JSON.

RULES:
1. Fix broken Bengali letters (e.g., 'বরুিনবাঁচিন' -> 'বহুনির্বাচনি', 'ুকোজ' -> 'গ্লুকোজ').
2. Extract ONLY the requested mode: "${mode}". If mode is AUTO, extract MCQ, SHORT, and CQ.
3. DO NOT mix CQ sub-questions (ক, খ, গ, ঘ) with MCQ options.
4. AUTO-ANSWER: If an MCQ answer is missing, solve it yourself and set "correct" to "A", "B", "C", or "D".
5. Format chemical formulas in LaTeX (e.g., $CO_2$).

Return ONLY valid JSON:
{
  "mcqs": [{ "number": 1, "text": "প্রশ্ন", "options": { "A": "ক", "B": "খ", "C": "গ", "D": "ঘ" }, "correct": "A", "flags": [] }],
  "shortQuestions": [{ "number": 1, "text": "প্রশ্ন", "marks": "২" }],
  "cqs": [{ "number": 1, "stimulus": "উদ্দীপক", "subQuestions": { "k": "ক", "kh": "খ", "g": "গ", "gh": "ঘ" } }]
}

Text:
${rawText.slice(0, 30000)}
`;

      const deepseekRes = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are a Bengali digitizer. Output only valid JSON." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 8000,
        }),
      });

      if (!deepseekRes.ok) {
        const errorData = await deepseekRes.text();
        throw new Error(`API Error: ${deepseekRes.status} - ${errorData}`);
      }

      const data = await deepseekRes.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) throw new Error("API থেকে কোনো রেসপন্স পাওয়া যায়নি।");

      let cleaned = content.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      }

      const parsed = JSON.parse(cleaned);
      return NextResponse.json({
        ok: true,
        mcqs: parsed.mcqs || [],
        shortQuestions: parsed.shortQuestions || [],
        cqs: parsed.cqs || [],
      });

    } catch (aiErr: any) {
      console.error("AI API Error:", aiErr);
      return NextResponse.json({ ok: false, error: `AI Error: ${aiErr?.message}` }, { status: 500 });
    }

  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "সার্ভার এরর" }, { status: 500 });
  }
}
