"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

async function requireStaff() {
  const s = await auth();
  const role = s?.user?.role;
  if (role !== "ADMIN" && role !== "TEACHER") throw new Error("Unauthorized");
}

const DIFFS = ["EASY", "MEDIUM", "HARD"] as const;
type Diff = (typeof DIFFS)[number];

function pickDiff(v: FormDataEntryValue | null): Diff {
  return DIFFS.includes(v as Diff) ? (v as Diff) : "MEDIUM";
}

const s = (v: FormDataEntryValue | null) => String(v ?? "").trim();

export async function addQuestion(fd: FormData) {
  await requireStaff();
  const type = s(fd.get("type")); // MCQ | WRITTEN
  const text = s(fd.get("text"));
  if (!text) throw new Error("প্রশ্ন লিখুন");

  let options: Record<string, string> = {};
  let correct = "";
  if (type === "MCQ") {
    options = { A: s(fd.get("A")), B: s(fd.get("B")), C: s(fd.get("C")), D: s(fd.get("D")) };
    correct = s(fd.get("correct")).toUpperCase();
    if (Object.values(options).some((v) => !v)) throw new Error("৪টি অপশনই দিন");
    if (!["A", "B", "C", "D"].includes(correct)) throw new Error("সঠিক উত্তর বেছে নিন");
  }

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
  revalidatePath("/admin/questions");
}

// প্রতি লাইনে একটি MCQ: প্রশ্ন | A | B | C | D | সঠিক(A-D) | ব্যাখ্যা
export async function importQuestions(fd: FormData) {
  await requireStaff();
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

  if (rows.length) await db.question.createMany({ data: rows });
  revalidatePath("/admin/questions");
}

export async function deleteQuestion(id: string) {
  await requireStaff();
  await db.question.delete({ where: { id } });
  revalidatePath("/admin/questions");
}

export async function toggleApproved(id: string) {
  await requireStaff();
  const q = await db.question.findUnique({ where: { id }, select: { approved: true } });
  if (!q) return;
  await db.question.update({ where: { id }, data: { approved: !q.approved } });
  revalidatePath("/admin/questions");
}
