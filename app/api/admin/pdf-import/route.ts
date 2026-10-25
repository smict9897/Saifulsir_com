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
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "❌ DEEPSEEK_API_KEY পাওয়া যায়নি!" }, { status: 400 });
    }

    try {
      // 🎯 ১. AI-এর কাছে শুধু টেক্সট ঠিক করার জন্য রিকোয়েস্ট পাঠানো (JSON নয়)
      const prompt = `
You are an expert Bengali editor. 
The following text is extracted from a PDF and has broken fonts, missing ligatures, and spelling errors (e.g., 'বরুিনবাঁচিন' should be 'বহুনির্বাচনি', 'ুকোজ' should be 'গ্লুকোজ').
Your task is to fix the Bengali spelling and broken characters.

RULES:
1. DO NOT change the structure or format of the text.
2. DO NOT answer the questions or add extra text.
3. Return ONLY the corrected text.

Text:
${rawText.slice(0, 25000)}
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
            { role: "system", content: "You are a text correction tool. Output only the fixed text." },
            { role: "user", content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 8192, // আউটপুট লিমিট বাড়ানো হলো
        }),
      });

      if (!deepseekRes.ok) {
        throw new Error(`API Error: ${deepseekRes.status}`);
      }

      const data = await deepseekRes.json();
      let fixedText = data?.choices?.[0]?.message?.content || rawText;

      // মার্কডাউন ক্লিন করা (যদি AI ```markdown দেয়)
      if (fixedText.startsWith("```")) {
        fixedText = fixedText.replace(/^```(?:markdown|text)?\s*/i, "").replace(/\s*```$/, "").trim();
      }

      // 🎯 ২. এবার এই ঠিক করা টেক্সটটি আপনার লোকাল পার্সারে পাঠানো হলো
      const fallbackData = parseAllQuestionsFromText(fixedText, mode);

      return NextResponse.json({
        ok: true,
        mcqs: fallbackData.mcqs || [],
        shortQuestions: fallbackData.shortQuestions || [],
        cqs: fallbackData.cqs || [],
      });

    } catch (aiErr: any) {
      console.error("AI API Error:", aiErr);
      
      // 🎯 ৩. যদি AI ফেইল করে, তবে লোকাল পার্সার দিয়ে যতটা সম্ভব চেষ্টা করা হবে
      const fallbackData = parseAllQuestionsFromText(rawText, mode);
      return NextResponse.json({
        ok: true,
        mcqs: fallbackData.mcqs || [],
        shortQuestions: fallbackData.shortQuestions || [],
        cqs: fallbackData.cqs || [],
      });
    }

  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "সার্ভার এরর" }, { status: 500 });
  }
}
