"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { staff } from "@/lib/guard";

const BACK = "/admin/questions";

const DIFFS = ["EASY", "MEDIUM", "HARD"] as const;
type Diff = (typeof DIFFS)[number];

const pickDiff = (v: FormDataEntryValue | null): Diff =>
  DIFFS.includes(v as Diff) ? (v as Diff) : "MEDIUM";

const s = (v: FormDataEntryValue | null) => String(v ?? "").trim();

const back = (msg: string, ok = false): never =>
  redirect(`${BACK}?${ok ? "ok" : "err"}=${encodeURIComponent(msg)}`);

// একটি প্রশ্ন হাতে যোগ করা
export async function addQuestion(fd: FormData) {
  await staff();

  const type = s(fd.get("type"));
  const text = s(fd.get("text"));
  if (!text) back("প্রশ্ন লিখুন");

  let options: Record<string, string> = {};
  let correct = "";
  if (type === "MCQ") {
    options = {
      A: s(fd.get("A")),
      B: s(fd.get("B")),
      C: s(fd.get("C")),
      D: s(fd.get("D")),
    };
    correct = s(fd.get("correct")).toUpperCase();
    if (Object.values(options).some((v) => !v)) back("৪টি অপশনই দিন");
    if (!["A", "B", "C", "D"].includes(correct)) back("সঠিক উত্তর বেছে নিন");
  }

  try {
    await db.question.create({
      data: {
        subject: s(fd.get("subject")),
        category: s(fd.get("category")),
        topic: s(fd.get("topic")),
        difficulty: pickDiff(fd.get("difficulty")),
        lang: s(fd.get("lang")) || "Bangla",
        text,
        options,
        correct,
        explanation: s(fd.get("explanation")),
        approved: true,
        source: s(fd.get("source")) || "Manual",
      },
    });
  } catch (e) {
    console.error("addQuestion failed:", e);
    back("সংরক্ষণ হয়নি: " + (e instanceof Error ? e.message.slice(-180) : "অজানা সমস্যা"));
  }

  revalidatePath(BACK);
  back("প্রশ্ন যোগ হয়েছে", true);
}

// প্রতি লাইনে: প্রশ্ন | A | B | C | D | correct(A-D) | ব্যাখ্যা
export async function importQuestions(fd: FormData) {
  await staff();

  const raw = s(fd.get("bulk"));
  const base = {
    subject: s(fd.get("subject")),
    category: s(fd.get("category")),
    topic: s(fd.get("topic")),
    difficulty: pickDiff(fd.get("difficulty")),
    lang: s(fd.get("lang")) || "Bangla",
    source: s(fd.get("source")) || "Import",
  };

  const rows = raw
    .split("\n")
    .map((l) => l.split("|").map((x) => x.trim()))
    .filter((c) => c.length >= 6 && c[0])
    .map((c) => ({
      ...base,
      text: c[0],
      options: { A: c[1], B: c[2], C: c[3], D: c[4] },
      correct: c[5].toUpperCase(),
      explanation: c[6] ?? "",
      approved: true,
    }))
    .filter((r) => ["A", "B", "C", "D"].includes(r.correct));

  if (!rows.length) back("কোনো সঠিক লাইন পাওয়া যায়নি। ফরম্যাট দেখুন");

  try {
    await db.question.createMany({ data: rows });
  } catch (e) {
    console.error("importQuestions failed:", e);
    back("ইমপোর্ট হয়নি: " + (e instanceof Error ? e.message.slice(-180) : "অজানা সমস্যা"));
  }

  revalidatePath(BACK);
  back(`${rows.length}টি প্রশ্ন ইমপোর্ট হয়েছে`, true);
}

// একটি প্রশ্ন মুছে ফেলা
export async function deleteQuestion(id: string) {
  await staff();
  try {
    await db.question.delete({ where: { id } });
  } catch (e) {
    console.error("deleteQuestion failed:", e);
  }
  revalidatePath(BACK);
  back("মুছে ফেলা হয়েছে", true);
}

// অনুমোদন চালু/বন্ধ করা
export async function toggleApproved(id: string) {
  await staff();
  try {
    const q = await db.question.findUnique({ where: { id }, select: { approved: true } });
    if (q) await db.question.update({ where: { id }, data: { approved: !q.approved } });
  } catch (e) {
    console.error("toggleApproved failed:", e);
  }
  revalidatePath(BACK);
  back("আপডেট হয়েছে", true);
}

// সব অপেক্ষমাণ প্রশ্ন একসাথে অনুমোদন
export async function approveAllPending() {
  await staff();
  try {
    await db.question.updateMany({ where: { approved: false }, data: { approved: true } });
  } catch (e) {
    console.error("approveAllPending failed:", e);
  }
  revalidatePath(BACK);
  back("সব অপেক্ষমাণ প্রশ্ন অনুমোদিত হয়েছে", true);
}

// PDF থেকে আনা প্রশ্ন একসাথে সংরক্ষণ
type IncomingItem = {
  text?: unknown;
  options?: { A?: unknown; B?: unknown; C?: unknown; D?: unknown };
  correct?: unknown;
  explanation?: unknown;
};

type SaveRecord = {
  subject: string;
  category: string;
  topic: string;
  difficulty: Diff;
  lang: string;
  text: string;
  options: { A: string; B: string; C: string; D: string };
  correct: string;
  explanation: string;
  approved: boolean;
  source: string;
};

export async function saveExtracted(
  meta: {
    subject: string;
    category: string;
    topic: string;
    difficulty: string;
    lang: string;
    source: string;
    approved: boolean;
  },
  items: IncomingItem[]
): Promise<{ ok: boolean; count?: number; error?: string }> {
  await staff();

  const difficulty: Diff =
    meta.difficulty === "EASY" || meta.difficulty === "HARD" ? meta.difficulty : "MEDIUM";

  const records: SaveRecord[] = [];

  for (const it of items) {
    const text = String(it.text ?? "").trim();
    if (text.length === 0) continue;

    const opts = it.options ?? {};
    const correctRaw = String(it.correct ?? "").trim().toUpperCase();

    records.push({
      subject: meta.subject,
      category: meta.category,
      topic: meta.topic,
      difficulty,
      lang: meta.lang || "Bangla",
      text,
      options: {
        A: String(opts.A ?? "").trim(),
        B: String(opts.B ?? "").trim(),
        C: String(opts.C ?? "").trim(),
        D: String(opts.D ?? "").trim(),
      },
      correct: ["A", "B", "C", "D"].includes(correctRaw) ? correctRaw : "",
      explanation: String(it.explanation ?? "").trim(),
      approved: meta.approved,
      source: meta.source || "PDF_IMPORT",
    });
  }

  if (records.length === 0) {
    return { ok: false, error: "সংরক্ষণ করার মতো কোনো প্রশ্ন নেই।" };
  }

  try {
    const res = await db.question.createMany({ data: records });
    revalidatePath(BACK);
    return { ok: true, count: res.count };
  } catch (e) {
    console.error("saveExtracted failed:", e);
    return { ok: false, error: "সংরক্ষণ হয়নি, আবার চেষ্টা করুন।" };
  }
}
