import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { callDeepSeekText } from "@/lib/deepseek";

export const maxDuration = 60;

const Body = z.object({
  topic: z.string().min(2).max(200),
  outline: z.array(z.string()).min(1),
  keywords: z.array(z.string()).optional(),
  prompt: z.string().optional(), 
});

export async function POST(req: Request) {
  const role = (await auth())?.user?.role;
  if (role !== "ADMIN") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });

  const p = Body.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json({ ok: false, error: "Invalid data" }, { status: 400 });

  const { topic, outline, keywords = [], prompt: customPrompt } = p.data;

  let customInstruction = "";
  if (customPrompt && customPrompt.trim().length > 0) {
    customInstruction = `
    IMPORTANT USER INSTRUCTIONS (Follow these strictly):
    "${customPrompt.trim()}"
    `;
  }

  const prompt = `You are an expert web content writer and a highly experienced, friendly human teacher from Bangladesh.

    Topic: "${topic}"
    Main Keywords to include: ${keywords.join(", ")}

    Write a comprehensive, engaging, and highly professional blog post in Bangla.

    ${customInstruction}

    *** CRITICAL STRUCTURAL FORMAT (You MUST follow this exact HTML structure) ***
    You must output the article in the following structure. Do NOT deviate from these specific Tailwind CSS classes.

    1. Hero Header Section:
    <header class="rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 p-6 text-white shadow-lg mb-8">
      <span class="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">${topic}</span>
      <h1 class="text-3xl font-bold mt-3 mb-2">[Make a Catchy H1 Title]</h1>
      <p class="opacity-90">[Write a short compelling description]</p>
    </header>

    2. Table of Contents (TOC):
    <div class="bg-white p-4 rounded-xl border border-slate-200 mb-8 shadow-sm">
      <h2 class="text-xl font-bold text-teal-700 mb-3">📑 সূচিপত্র</h2>
      <ul class="list-disc pl-5 space-y-1 text-blue-600">
         [Create anchor links for each H2 section]
      </ul>
    </div>

    3. Revision Table (Only if applicable to the topic):
    <div class="overflow-x-auto rounded-xl border border-slate-200 mb-8 shadow-sm">
      <table class="w-full text-left border-collapse">
        <thead class="bg-teal-600 text-white">
          <tr><th class="p-3 border-b">শিরোনাম</th><th class="p-3 border-b">বিবরণ</th></tr>
        </thead>
        <tbody class="bg-white">
          <tr><td class="p-3 border-b">[Item 1]</td><td class="p-3 border-b">[Description]</td></tr>
        </tbody>
      </table>
    </div>

    4. Main Content Sections (For each H2 in the outline):
    <article class="bg-white border-l-4 border-teal-500 rounded-r-xl p-5 mb-6 shadow-sm">
      <h2 class="text-2xl font-bold text-teal-800 mb-3">[H2 Heading]</h2>
      <p class="text-slate-700 leading-relaxed mb-3">[Detailed paragraph]</p>
      
      <!-- Include an Exam Point Box -->
      <div class="bg-emerald-50 border border-emerald-200 border-dashed rounded-lg p-4 mt-4 text-emerald-900">
        <strong>🎯 পরীক্ষার পয়েন্ট:</strong> [Write a tip for exams here]
      </div>
    </article>

    5. FAQ Section (At the end):
    <div class="mt-8 space-y-3">
      <h2 class="text-2xl font-bold text-teal-800 mb-4">❓ সাধারণ প্রশ্নোত্তর (FAQ)</h2>
      <details class="bg-white border border-slate-200 rounded-lg p-4">
        <summary class="font-semibold text-teal-700 cursor-pointer">[Question here]</summary>
        <p class="mt-2 text-slate-600">[Answer here]</p>
      </details>
    </div>

    6. Author Card (At the very end of the article):
    <div class="mt-12 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
      <img src="/saiful.jpg" alt="Md. Saiful Islam" class="w-24 h-24 rounded-full object-cover border-4 border-teal-100 shadow-md mb-4" />
      <h3 class="text-xl font-bold text-slate-800 mb-1">Blog Writer: MD.SAIFUL ISLAM</h3>
      <p class="text-sm font-semibold text-teal-700 mb-2">Assistant Teacher (ICT)</p>
      <p class="text-sm text-slate-600 mb-1">S.N.P High School And College</p>
      <p class="text-xs text-slate-500">Nabiganj, Hobiganj</p>
    </div>

    *** RULES ***
    - Write in a conversational, empathetic, and friendly Bangla tone.
    - Return ONLY valid HTML code. DO NOT wrap in \`\`\`html.
    - DO NOT use Markdown (no #, no **).
    - Write AT LEAST 1500 words.`;

  const r = await callDeepSeekText(prompt, 0.6, 8192); 
  
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status || 500 });

  let cleanHtml = String(r.data || "");
  
  if (cleanHtml.startsWith("```html")) {
    cleanHtml = cleanHtml.replace(/^```html\n?/, "").replace(/```$/, "");
  } else if (cleanHtml.startsWith("```")) {
    cleanHtml = cleanHtml.replace(/^```\n?/, "").replace(/```$/, "");
  }

  return NextResponse.json({ ok: true, content: cleanHtml });
}
