import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_BYTES = 4_200_000;
const TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const DIFFS = ["EASY", "MEDIUM", "HARD"] as const;

const Items = z.array(
  z.object({
    text: z.string().min(1),
    options: z.object({ A: z.string(), B: z.string(), C: z.string(), D: z.string() }),
    correct: z.enum(["A", "B", "C", "D"]),
    explanation: z.string().default(""),
  }),
);

const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN") return fail("অনুমতি নেই", 403);

  let fd: FormData;
  try { fd = await req.formData(); } catch { return fail("ফাইল পড়া যায়নি।"); }

  const file = fd.get("file");
  if (!(file instanceof File) || !file.size) return fail("একটি ফাইল বেছে নিন।");
  if (!TYPES.includes(file.type)) return fail("শুধু PDF, JPG, PNG বা WEBP ফাইল দিন।");
  if (file.size > MAX_BYTES) return fail("ফাইল ৪ MB এর বেশি। পেজ কমিয়ে বা ছোট করে দিন।");

  const category = str(fd.get("category"));
  const subject = str(fd.get("subject"));
  const topic = str(fd.get("topic"));
  if (!category || !subject) return fail("ক্লাস ও বিষয় দিন।");
  const d = str(fd.get("difficulty"));
  const difficulty = (DIFFS as readonly string[]).includes(d) ? (d as (typeof DIFFS)[number]) : "MEDIUM";
  const lang = str(fd.get("lang")) === "English" ? "English" : "Bangla";
  const source = str(fd.get("source")) || "PDF/ছবি";
  const approved = str(fd.get("approve")) === "1";

  const prompt = `You are digitizing an exam paper. Extract every multiple-choice question from the attached document exactly as written: keep the original language, numbers, math and punctuation. Ignore written or creative questions. Map option labels ক/খ/গ/ঘ, a/b/c/d or 1/2/3/4 to A/B/C/D. If the document shows an answer key or marked answers, use it; otherwise work out the most likely correct answer yourself. Add a short explanation in Bangla (1-2 sentences). Return ONLY a JSON array. Each item: {"text","options":{"A","B","C","D"},"correct":"A|B|C|D","explanation"}. At most 60 questions. If there are none, return [].`;

  try {
    const data64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: file.type, data: data64 } }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );
    if (!res.ok) {
      console.error("extract gemini failed:", res.status, (await res.text()).slice(0, 300));
      return fail("AI ফাইলটা পড়তে পারেনি। একটু পরে আবার চেষ্টা করুন।", 502);
    }
    const j = await res.json();
    const text: string = j.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
    const items = Items.parse(JSON.parse(text.replace(/```json|```/g, "").trim()));
    if (!items.length) return fail("ফাইলে কোনো MCQ প্রশ্ন পাওয়া যায়নি।");

    await db.question.createMany({
      data: items.map((q) => ({
        subject, category, topic, difficulty, lang,
        text: q.text, options: q.options, correct: q.correct, explanation: q.explanation,
        approved, source,
      })),
    });
    return NextResponse.json({ ok: true, count: items.length, approved });
  } catch (e) {
    console.error("extract failed:", e);
    return fail("প্রশ্ন বের করা যায়নি। পরিষ্কার ছবি বা কম পেজের PDF দিয়ে আবার চেষ্টা করুন।", 500);
  }
}
