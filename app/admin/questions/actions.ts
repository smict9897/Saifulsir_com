"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const BACK = "/admin/questions";

async function isStaff() {
  const s = await auth();
  const role = s?.user?.role;
  return role === "ADMIN" || role === "TEACHER";
}

const DIFFS = ["EASY", "MEDIUM", "HARD"] as const;
type Diff = (typeof DIFFS)[number];
const pickDiff = (v: FormDataEntryValue | null): Diff =>
  DIFFS.includes(v as Diff) ? (v as Diff) : "MEDIUM";
const s = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const back = (msg: string, ok = false) =>
  redirect(`${BACK}?${ok ? "ok" : "err"}=${encodeURIComponent(msg)}`);

export async function addQuestion(fd: FormData) {
  if (!(await isStaff())) back("অনুমতি নেই");

  const type = s(fd.get("type"));
  const text = s(fd.get("text"));
  if (!text) back("প্রশ্ন লিখুন");

  let options: Record<string, string> = {};
  let correct = "";
  if (type === "MCQ") {
    options = { A: s(fd.get("A")), B: s(fd.get("B")), C: s(fd.get("C")), D: s(fd.get("D")) };
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

// প্রতি লাইনে: প্রশ্ন | A | B | C | D | সঠিক(A-D) | ব্যাখ্যা
export async function importQuestions(fd: FormData) {
  if (!(await isStaff())) back("অনুমতি নেই");

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

export async function deleteQuestion(id: string) {
  if (!(await isStaff())) back("অনুমতি নেই");
  try {
    await db.question.delete({ where: { id } });
  } catch (e) {
    console.error("deleteQuestion failed:", e);
  }
  revalidatePath(BACK);
  back("মুছে ফেলা হয়েছে", true);
}

export async function toggleApproved(id: string) {
  if (!(await isStaff())) back("অনুমতি নেই");
  try {
    const q = await db.question.findUnique({ where: { id }, select: { approved: true } });
    if (q) await db.question.update({ where: { id }, data: { approved: !q.approved } });
  } catch (e) {
    console.error("toggleApproved failed:", e);
  }
  revalidatePath(BACK);
  back("আপডেট হয়েছে", true);
}
