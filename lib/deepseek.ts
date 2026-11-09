// lib/deepseek.ts

export async function callDeepSeekJson(
  prompt: string,
  temperature = 0.6,
  maxTokens = 4096
) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("DEEPSEEK_API_KEY is missing");
    return { ok: false, error: "সার্ভারে এআই কনফিগারেশন নেই।", status: 500 };
  }

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
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
            content: "You are a helpful assistant designed to output JSON. Always output valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: temperature,
        max_tokens: maxTokens,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        ok: false, 
        error: data.error?.message || "DeepSeek এআই সার্ভারে সমস্যা হয়েছে।", 
        status: response.status 
      };
    }

    const content = data.choices[0]?.message?.content;
    if (!content) {
      return { ok: false, error: "এআই কোনো উত্তর দেয়নি।", status: 502 };
    }

    try {
      return { ok: true, data: JSON.parse(content) };
    } catch (parseError) {
      console.error("JSON Parse Error:", content);
      return { ok: false, error: "এআই ভুল ফরম্যাটে উত্তর দিয়েছে।", status: 502 };
    }

  } catch (error) {
    console.error("DeepSeek Fetch Error:", error);
    return { ok: false, error: "নেটওয়ার্ক বা সার্ভার সমস্যা হয়েছে।", status: 500 };
  }
}

// 👇 নতুন ফাংশন: যা JSON ছাড়া সরাসরি HTML আর্টিকেল লিখবে 👇
export async function callDeepSeekText(
  prompt: string,
  temperature = 0.6,
  maxTokens = 8192
) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "সার্ভারে এআই কনফিগারেশন নেই।", status: 500 };
  }

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
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
            content: "You are an expert SEO content writer. You MUST output ONLY valid HTML code. Do NOT use Markdown syntax like #, **, or - for lists. Use proper HTML tags (<h2>, <p>, <ul>, <li>, <strong>, <table>). Do not wrap the output in ```html blocks.",
          },
          { role: "user", content: prompt },
        ],
        temperature: temperature,
        max_tokens: maxTokens,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, error: data.error?.message || "DeepSeek সার্ভারে সমস্যা হয়েছে।", status: response.status };
    }

    const content = data.choices[0]?.message?.content;
    if (!content) {
      return { ok: false, error: "এআই কোনো উত্তর দেয়নি।", status: 502 };
    }

    return { ok: true, data: content };
  } catch (error) {
    return { ok: false, error: "নেটওয়ার্ক সমস্যা হয়েছে।", status: 500 };
  }
}
