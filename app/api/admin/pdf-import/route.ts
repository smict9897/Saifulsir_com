import { NextResponse } from "next/server";
import { staff } from "@/lib/guard";
import { parseAllQuestionsFromText } from "@/lib/pdf-mcq/parse";

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

    // 🚀 DeepSeek-V3 AI দিয়ে ১০০% নির্ভুল বাংলা বানান ও প্রশ্ন রিস্টোর করা
    if (apiKey) {
      try {
        const prompt = `
You are an expert Bengali educational digitizer and OCR correction engine.
The following text was extracted from a Bangladeshi school/board question paper PDF.
Due to PDF font encoding issues, many Bengali words have broken ligatures, missing conjuncts, and mangled matras.
Examples of common errors to fix:
- 'ুকোজ' -> 'গ্লুকোজ'
- 'ূকোজ' -> 'ফ্রুক্টোজ'
- 'সলুলোজ' -> 'সেলুলোজ'
- 'মাবাইল ফান' -> 'মোবাইল ফোন'
- 'বি ানী' -> 'বিজ্ঞানী'
- 'কানট সঠক?' -> 'কোনটি সঠিক?'
- 'ব্যব্ া' -> 'ব্যবস্থা'
- 'পদাথ' -> 'পদার্থ'
- 'আন্ত র্জাতিক' -> 'আন্তর্জাতিক'
- 'থথ্যপ্রযুকিত' -> 'তথ্যপ্রযুক্তি'
- 'ই-লানিং' -> 'ই-লার্নিং'
- 'দনন্দিন' -> 'দৈনন্দিন'

Your instructions:
1. Fix all spelling mistakes, restore missing letters/conjuncts based on the sentence and subject context.
2. Structure the questions into JSON based on the requested mode: "${mode}".
   - "MCQ": Extract multiple choice questions with options A, B, C, D (mapped from ক, খ, গ, ঘ).
   - "SHORT": Extract 1-mark or 2-mark short questions without options.
   - "CQ": Extract creative questions with stimulus (উদ্দীপক) and sub-questions (ক, খ, গ, ঘ).
   - "AUTO": Detect and separate all matching sections.
3. For chemical formulas (like CO2, H2SO4, NH4Cl) and mathematical fractions, format with LaTeX math (e.g., $CO_2$, $\\frac{1}{3}$).

Return a valid JSON object ONLY (no markdown code blocks, no backticks, no comments) with this exact schema:
{
  "mcqs": [
    {
      "number": 1,
      "text": "শুদ্ধ প্রশ্ন",
      "options": { "A": "অপশন ক", "B": "অপশন খ", "C": "অপশন গ", "D": "অপশন ঘ" },
      "correct": "A",
      "flags": []
    }
  ],
  "shortQuestions": [
    {
      "number": 1,
      "text": "সংক্ষিপ্ত প্রশ্ন",
      "marks": "২"
    }
  ],
  "cqs": [
    {
      "number": 1,
      "stimulus": "উদ্দীপক...",
      "subQuestions": { "k": "প্রশ্ন ক", "kh": "প্রশ্ন খ", "g": "প্রশ্ন গ", "gh": "প্রশ্ন ঘ" }
    }
  ]
}

Raw Text to Process:
${rawText.slice(0, 35000)}
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
              {
                role: "system",
                content: "You are a professional Bengali exam digitizer. You always output valid, clean JSON with 100% correct Bengali spelling and grammar.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          }),
        });

        const data = await deepseekRes.json();
        const content = data?.choices?.[0]?.message?.content;

        if (content) {
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
        }
      } catch (aiErr) {
        console.error("DeepSeek API call failed, falling back to local parser:", aiErr);
      }
    }

    // ফলব্যাক: লোকাল রেজেক্স পার্সার (যদি কোনো কারণে এপিআই কাজ না করে)
    const fallbackData = parseAllQuestionsFromText(rawText, mode);
    return NextResponse.json({
      ok: true,
      mcqs: fallbackData.mcqs || [],
      shortQuestions: fallbackData.shortQuestions || [],
      cqs: fallbackData.cqs || [],
    });
  } catch (err: any) {
    console.error("PDF Import API Route Error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "সার্ভার এরর হয়েছে।" }, { status: 500 });
  }
}
