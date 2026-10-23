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

    if (apiKey) {
      try {
        const prompt = `
You are an expert Bengali educational digitizer and OCR correction engine. 
I am providing you with raw text extracted from a Bangladeshi school/board question paper PDF. 
This PDF has severe font encoding issues, resulting in broken Bengali ligatures, missing letters, and reversed matras. 
It may also contain multiple columns (2 or 3) mixed together, and image placeholders.

YOUR TASKS:
1. **Restore Bengali Text**: Use your deep knowledge of the Bengali language and context to fix ALL broken words. 
   Examples of common errors:
   - 'বরুিনবাঁচিন অশ্ব' -> 'বহুনির্বাচনি অংশ'
   - 'প্রচিতি প্রশ্নের' -> 'সৃজনশীল প্রশ্নের'
   - 'ুকোজ' -> 'গ্লুকোজ', 'মাবাইল ফান' -> 'মোবাইল ফোন', 'পদাথ' -> 'পদার্থ'
   - 'ই-লানি◌্ং' -> 'ই-লার্নিং', 'সঠক?' -> 'সঠিক?'

2. **Extract Questions**: Based on the requested mode "${mode}":
   - "AUTO": Detect and separate MCQ, Short Questions, and CQ (Creative Questions).
   - "MCQ": Extract only multiple choice questions.
   - "SHORT": Extract only short questions (no options).
   - "CQ": Extract only creative questions (উদ্দীপক + ক, খ, গ, ঘ).

3. **Separate Sections**: 
   - MCQ has options (ক, খ, গ, ঘ). It should go to "mcqs".
   - Short questions are standalone and end with a question mark or directive. It should go to "shortQuestions".
   - CQ has a stimulus (উদ্দীপক) and sub-questions (ক, খ, গ, ঘ). DO NOT confuse sub-questions with MCQ options. It should go to "cqs".

4. **🚨 AUTO-ANSWER GENERATION 🚨**: 
   If an MCQ does not have an answer marked in the text (like bold or [Ans: ক]), you MUST determine the correct answer using your subject knowledge. 
   Set the "correct" field to "A", "B", "C", or "D". NEVER leave "correct" blank.

5. **LaTeX Formatting**: For chemical formulas (e.g., CO2, H2SO4, NH4Cl) and math fractions, wrap them in LaTeX math (e.g., $CO_2$, $\\frac{1}{3}$).

CRITICAL: Return a valid JSON object ONLY (no markdown, no backticks, no extra text). Follow this exact schema:
{
  "mcqs": [
    { "number": 1, "text": "শুদ্ধ প্রশ্ন", "options": { "A": "অপশন ক", "B": "অপশন খ", "C": "অপশন গ", "D": "অপশন ঘ" }, "correct": "A", "flags": [] }
  ],
  "shortQuestions": [
    { "number": 1, "text": "সংক্ষিপ্ত প্রশ্ন", "marks": "২" }
  ],
  "cqs": [
    { "number": 1, "stimulus": "উদ্দীপক...", "subQuestions": { "k": "প্রশ্ন ক", "kh": "প্রশ্ন খ", "g": "প্রশ্ন গ", "gh": "প্রশ্ন ঘ" } }
  ]
}

Raw Text to Process:
${rawText.slice(0, 40000)}
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
                content: "You are a professional Bengali exam digitizer. You always output valid, clean JSON with 100% correct Bengali spelling. You NEVER leave MCQ answers blank; if missing, you solve them yourself.",
              },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
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

    // Fallback: লোকাল রেজেক্স পার্সার
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
