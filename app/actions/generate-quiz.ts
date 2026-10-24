"use server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const maxDuration = 60; // Vercel টাইমআউট বাড়ানোর জন্য

const Input = z.object({
  subject: z.string().min(1), category: z.string().min(1), topic: z.string().min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]), count: z.coerce.number().int().min(1).max(20),
  lang: z.enum(["Bangla", "English"]),
  type: z.enum(["MCQ", "SHORT", "CQ", "MIXED"]).optional(), // 🎯 নতুন টাইপ যুক্ত করা হলো
  avoid: z.array(z.string()).max(60).optional(),
});

// 🎯 Zod Schema আপডেট করা হলো যাতে MCQ, SHORT এবং CQ তিনটিই সাপোর্ট করে
const Quiz = z.array(z.object({
  type: z.enum(["MCQ", "SHORT", "CQ"]).optional(),
  text: z.string(),
  options: z.object({ A: z.string(), B: z.string(), C: z.string(), D: z.string() }).optional(),
  correct: z.enum(["A", "B", "C", "D"]).optional(),
  explanation: z.string().optional(),
  stimulus: z.string().optional(),
  subQuestions: z.object({ k: z.string(), kh: z.string(), g: z.string(), gh: z.string() }).optional(),
}));
export type QuizItem = z.infer<typeof Quiz>[number];

export async function generateQuiz(raw: unknown): Promise<{ ok: true; items: QuizItem[] } | { ok: false; error: string }> {
  const p = Input.safeParse(raw);
  if (!p.success) return { ok: false, error: "Check the form fields and try again." };
  const { subject, category, topic, difficulty, count, lang, avoid, type = "MCQ" } = p.data;
  
  const avoidText = avoid && avoid.length
    ? ` Do NOT repeat or closely paraphrase any of these existing questions: ${avoid.join(" ; ")}.`
    : "";

  // 🎯 প্রশ্নের ধরন অনুযায়ী প্রম্পট তৈরি
  let prompt = "";
  if (type === "MCQ") {
    prompt = `Create ${count} ${difficulty} multiple-choice questions for ${category} ${subject}, topic "${topic}", written in ${lang}.${avoidText} Return ONLY a JSON array. Each item: {"type": "MCQ", "text", "options": {"A","B","C","D"}, "correct": "A|B|C|D", "explanation"}.`;
  } else if (type === "SHORT") {
    prompt = `Create ${count} ${difficulty} short questions for ${category} ${subject}, topic "${topic}", written in ${lang}.${avoidText} Return ONLY a JSON array. Each item: {"type": "SHORT", "text", "explanation"}.`;
  } else if (type === "CQ") {
    prompt = `Create ${count} ${difficulty} creative questions (CQ) for ${category} ${subject}, topic "${topic}", written in ${lang}.${avoidText} Return ONLY a JSON array. Each item: {"type": "CQ", "stimulus": "...", "subQuestions": {"k": "...", "kh": "...", "g": "...", "gh": "..."}}.`;
  } else {
    prompt = `Create a mix of MCQ, Short, and CQ questions for ${category} ${subject}, topic "${topic}", written in ${lang}. Total ${count} items.${avoidText} Return ONLY a JSON array following standard formats.`;
  }

  try {
    // 🎯 Gemini থেকে DeepSeek API-তে পরিবর্তন করা হলো
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are an expert Bengali exam generator. You must output a valid JSON array ONLY." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) return { ok: false, error: "The AI service did not respond. Try again in a moment." };
    const data = await res.json();
    
    // DeepSeek থেকে আসা JSON ক্লিন করা
    let text: string = data.choices?.[0]?.message?.content ?? "[]";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(text);
    const items = Array.isArray(parsed) ? parsed : parsed.items || parsed.questions || [];
    
    return { ok: true, items: Quiz.parse(items) };
  } catch (err) {
    console.error("DeepSeek API error:", err);
    return { ok: false, error: "Could not read the AI response. Generate again." };
  }
}

const SaveInput = z.object({
  subject: z.string().min(1), category: z.string().min(1), topic: z.string().min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]), lang: z.enum(["Bangla", "English"]),
  items: Quiz,
});

export async function saveQuizToBank(
  raw: unknown,
): Promise<{ ok: true; ids: string[] } | { ok: false; error: string }> {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "TEACHER")
    return { ok: false, error: "প্রশ্নপত্র বানাতে অ্যাডমিন বা শিক্ষক হিসেবে লগইন করুন।" };
  const p = SaveInput.safeParse(raw);
  if (!p.success || !p.data.items.length)
    return { ok: false, error: "সেভ করার মতো প্রশ্ন পাওয়া যায়নি।" };
  const { subject, category, topic, difficulty, lang, items } = p.data;
  const diff = difficulty.toUpperCase() as "EASY" | "MEDIUM" | "HARD";
  
  try {
    const rows = await db.$transaction(
      items.map((q) =>
        db.question.create({
          data: {
            subject, category, topic, difficulty: diff, lang,
            // 🎯 Short/CQ এর জন্য অপশন না থাকলে খালি অবজেক্ট সেভ হবে
            text: q.text || q.stimulus || "", 
            options: q.options || q.subQuestions || {}, 
            correct: q.correct || "", 
            explanation: q.explanation || "",
            approved: true, source: "AI",
          },
          select: { id: true },
        }),
      ),
    );
    return { ok: true, ids: rows.map((r) => r.id) };
  } catch (e) {
    console.error("saveQuizToBank failed:", e);
    return { ok: false, error: "সেভ হয়নি। আবার চেষ্টা করুন।" };
  }
}
