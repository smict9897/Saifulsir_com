import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { callDeepSeekJson } from "@/lib/deepseek";

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
Write a comprehensive, engaging blog post in Bangla (or mixed Bangla-English as appropriate for students) following this exact outline:

${outline.map((h, i) => `## ${h}\n(Write 2-3 paragraphs for this section)`).join("\n\n")}

Rules:
- Use Markdown formatting (## for headings, bold text, bullet points).
- Do not include the main title (H1), start directly with the first H2.
- Write at least 800-1200 words.
- Tone should be helpful, educational, and easy to understand.
- Return ONLY the markdown content, no JSON, no extra text.`;

  // max_tokens বাড়িয়ে 8192 করা হলো যাতে লম্বা আর্টিকেল তৈরি হয়
  const r = await callDeepSeekJson<{ content: string }>(prompt, 0.7, 8192); 
  
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status || 500 });

  // DeepSeek JSON মোডে রেসপন্স দিলে সেটি থেকে মার্কডাউন বের করা
  return NextResponse.json({ ok: true, content: r.data.content || (r.data as any).article || "" });
}
