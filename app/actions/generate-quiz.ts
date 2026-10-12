"use server";
import { z } from "zod";

const Input = z.object({
  subject: z.string().min(1), category: z.string().min(1), topic: z.string().min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]), count: z.coerce.number().int().min(1).max(20),
  lang: z.enum(["Bangla", "English"]),
});
const Quiz = z.array(z.object({
  text: z.string(), options: z.object({ A: z.string(), B: z.string(), C: z.string(), D: z.string() }),
  correct: z.enum(["A", "B", "C", "D"]), explanation: z.string(),
}));
export type QuizItem = z.infer<typeof Quiz>[number];

export async function generateQuiz(raw: unknown): Promise<{ ok: true; items: QuizItem[] } | { ok: false; error: string }> {
  const p = Input.safeParse(raw);
  if (!p.success) return { ok: false, error: "Check the form fields and try again." };
  const { subject, category, topic, difficulty, count, lang } = p.data;
  const prompt = `Create ${count} ${difficulty} multiple-choice questions for ${category} ${subject}, topic "${topic}", written in ${lang}. Return ONLY a JSON array. Each item: {"text","options":{"A","B","C","D"},"correct":"A|B|C|D","explanation"}. Explanations must be detailed and written in Bangla.`;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL ?? "gemini-2.0-flash"}:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
// TODO: saveApproved(items) -> prisma.question.createMany, guarded by an ADMIN/TEACHER session check
