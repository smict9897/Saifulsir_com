"use server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const Input = z.object({
  subject: z.string().min(1), category: z.string().min(1), topic: z.string().min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]), count: z.coerce.number().int().min(1).max(20),
  lang: z.enum(["Bangla", "English"]),
  avoid: z.array(z.string()).max(60).optional(),
});
const Quiz = z.array(z.object({
  text: z.string(), options: z.object({ A: z.string(), B: z.string(), C: z.string(), D: z.string() }),
  correct: z.enum(["A", "B", "C", "D"]), explanation: z.string(),
}));
export type QuizItem = z.infer<typeof Quiz>[number];

export async function generateQuiz(raw: unknown): Promise<{ ok: true; items: QuizItem[] } | { ok: false; error: string }> {
  const p = Input.safeParse(raw);
  if (!p.success) return { ok: false, error: "Check the form fields and try again." };
  const { subject, category, topic, difficulty, count, lang, avoid } = p.data;
  const avoidText = avoid && avoid.length
    ? ` Do NOT repeat or closely paraphrase any of these existing questions: ${avoid.join(" ; ")}.`
    : "";
  const prompt = `Create ${count} ${difficulty} multiple-choice questions for ${category} ${subject}, topic "${topic}", written in ${lang}. Make the questions varied.${avoidText} Return ONLY a JSON array. Each item: {"text","options":{"A","B","C","D"},"correct":"A|B|C|D","explanation"}. Explanations must be detailed and written in Bangla.`;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL ?? "gemini-3.5-flash"}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }) },
    );
    if (!res.ok) return { ok: false, error: "The AI service did not respond. Try again in a moment." };
    const data = await res.json();
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
    return { ok: true, items: Quiz.parse(JSON.parse(text.replace(/```json|```/g, "").trim())) };
  } catch {
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
            text: q.text, options: q.options, correct: q.correct, explanation: q.explanation,
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
