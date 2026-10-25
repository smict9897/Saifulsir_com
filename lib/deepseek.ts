// lib/deepseek.ts
import type { KeywordItem, SeoPack } from "@/lib/keyword-research";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-chat"; // অথবা "deepseek-coder" ব্যবহার করতে পারেন

type AIResult<T> = { ok: true; data: T } | { ok: false; error: string; status?: number };

/**
 * মূল DeepSeek API কলার (Core Function)
 * এটি সবসময় JSON রেসপন্স দেবে।
 */
export async function callDeepSeekJson<T>(
  prompt: string,
  temperature = 0.6,
  maxTokens = 4096 // আউটপুট বাড়ানোর জন্য এটি পরিবর্তন করতে পারেন (সর্বোচ্চ 8192)
): Promise<AIResult<T>> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    console.error("DEEPSEEK_API_KEY is missing in .env");
    return { ok: false, error: "সার্ভারে এআই কনফিগারেশন নেই।", status: 500 };
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            // DeepSeek-কে JSON আউটপুট দিতে বাধ্য করার জন্য এই নির্দেশনা জরুরি
            content: "You are a professional SEO assistant. You must output ONLY valid JSON. Do not wrap the JSON in markdown code blocks or add any explanatory text.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" }, // JSON মোড অন করা হলো
        temperature,
        max_tokens: maxTokens,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("DeepSeek API Error:", data);
      return { 
        ok: false, 
        error: data.error?.message || "DeepSeek এআই সার্ভারে সমস্যা হয়েছে।", 
        status: response.status 
      };
    }

    // JSON পার্স করা
    const content = data.choices[0]?.message?.content;
    if (!content) {
      return { ok: false, error: "এআই কোনো উত্তর দেয়নি।", status: 502 };
    }

    try {
      const parsedData = JSON.parse(content) as T;
      return { ok: true, data: parsedData };
    } catch (parseError) {
      console.error("JSON Parse Error. Raw content:", content);
      return { ok: false, error: "এআই ভুল ফরম্যাটে উত্তর দিয়েছে। আবার চেষ্টা করুন।", status: 502 };
    }

  } catch (error) {
    console.error("DeepSeek Fetch Error:", error);
    return { ok: false, error: "নেটওয়ার্ক বা সার্ভার সমস্যা হয়েছে।", status: 500 };
  }
}

/**
 * ১. কিওয়ার্ড রিসার্চ জেনারেটর
 */
export async function generateKeywords(
  topic: string,
  lang: string,
  audience: string,
  count: number
): Promise<AIResult<{ items: KeywordItem[] }>> {
  const prompt = `You are an SEO keyword researcher for a Bangladeshi education website.
Topic: "${topic}"
Language preference: ${lang}
Target Audience: ${audience}
Generate exactly ${count} highly relevant keywords.

Return a JSON object with exactly this structure:
{
  "items": [
    {
      "keyword": "the keyword text",
      "type": "Primary" | "Long-tail" | "Question",
      "intent": "Informational" | "Download" | "Solution" | "Preparation",
      "difficulty": "Low" | "Medium" | "High",
      "monthlySearchEst": "e.g., 1K - 5K",
      "usageTip": "Short tip in Bangla on where to use this keyword"
    }
  ]
}`;

  return callDeepSeekJson<{ items: KeywordItem[] }>(prompt, 0.7, 3000);
}

/**
 * ২. SEO প্যাক জেনারেটর
 */
export async function generateSeoPack(
  topic: string,
  keywords: string[]
): Promise<AIResult<{ pack: SeoPack }>> {
  const prompt = `You are an SEO content strategist for a Bangladeshi education website.
Blog topic: "${topic}"
Target keywords (the first one is the main focus keyword): ${keywords.map((k) => `"${k}"`).join(", ")}

Create an SEO pack for one blog post. Return a JSON object with exactly these fields:
- "titles": array of 3 catchy blog post titles that naturally include the main keyword (Bangla or mixed Bangla-English, max 100 characters each)
- "slug": a short English URL slug using lowercase letters, numbers and hyphens only
- "metaTitle": string, maximum 60 characters, includes the main keyword
- "metaDescription": string, maximum 160 characters, includes the main keyword and a reason to click
- "hashtags": array of 5 to 8 hashtags without the # symbol and without spaces
- "outline": array of 6 to 10 H2 headings for the article, in order
- "faqs": array of 4 to 6 question-style FAQ questions students or job seekers would ask

Return ONLY valid JSON in this exact structure:
{
  "pack": {
    "titles": ["..."],
    "slug": "...",
    "metaTitle": "...",
    "metaDescription": "...",
    "hashtags": ["..."],
    "outline": ["..."],
    "faqs": ["..."]
  }
}`;

  return callDeepSeekJson<{ pack: SeoPack }>(prompt, 0.6, 4096);
}
