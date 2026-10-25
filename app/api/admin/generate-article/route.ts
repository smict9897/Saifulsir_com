import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { callDeepSeekText } from "@/lib/deepseek"; 

export const maxDuration = 60;

const Body = z.object({
  topic: z.string().min(2).max(200),
  outline: z.array(z.string()).min(1),
  keywords: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  const role = (await auth())?.user?.role;
  if (role !== "ADMIN") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });

  const p = Body.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json({ ok: false, error: "Invalid data" }, { status: 400 });

  const { topic, outline, keywords = [] } = p.data;

  const prompt = `You are an expert SEO content writer for a Bangladeshi education website.
Topic: "${topic}"
Main Keywords to include: ${keywords.join(", ")}

Write a comprehensive, engaging, and highly professional blog post in Bangla (or mixed Bangla-English) following this exact outline:

${outline.map((h, i) => `<h2>${h}</h2>\n(Write 2-3 paragraphs for this section)`).join("\n\n")}

CRITICAL RULES:
1. Return ONLY valid HTML code (No Markdown, No \`\`\`html blocks).
2. Use semantic HTML tags: <h2> for subheadings, <p> for paragraphs, <strong> for bold text, <ul>/<li> for bullet points.
3. If you create tables, use <table>, <thead>, <tbody>, <tr>, <th>, <td> with proper structure.
4. Do not include the main title (H1), start directly with the first <h2>.
5. Do NOT include any text outside the HTML tags. Start directly with the first <h2>.
6. Write at least 800-1200 words. The tone should be educational and professional.`;

  const r = await callDeepSeekText(prompt, 0.7, 8192); 
  
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status || 500 });

  // 👇 এখানে TypeScript এরর ফিক্স করা হয়েছে 👇
  let cleanHtml = String(r.data || "");
  
  if (cleanHtml.startsWith("```html")) {
    cleanHtml = cleanHtml.replace(/^```html\n?/, "").replace(/```$/, "");
  } else if (cleanHtml.startsWith("```")) {
    cleanHtml = cleanHtml.replace(/^```\n?/, "").replace(/```$/, "");
  }

  return NextResponse.json({ ok: true, content: cleanHtml });
}
