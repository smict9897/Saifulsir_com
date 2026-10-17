import Link from "next/link";
import { db } from "@/lib/db";
import QbPicker from "@/components/qb-picker";

export const dynamic = "force-dynamic";
export const metadata = { title: "প্রশ্ন নির্বাচন" };

type SP = { category?: string; subject?: string; topic?: string; type?: string; q?: string; page?: string };
const PER_PAGE = 15;

export default async function CreatePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const category = sp.category ?? "";
  const subject = sp.subject ?? "";
  const topic = sp.topic ?? "";
  const type = sp.type === "written" ? "written" : "mcq";
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page) || 1);

  const base = {
    approved: true,
    ...(category ? { category } : {}),
    ...(subject ? { subject } : {}),
  };
  const where = {
    ...base,
    ...(topic ? { topic } : {}),
    correct: type === "mcq" ? { not: "" } : "",
    ...(q ? { text: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [rows, total, topicRows] = await Promise.all([
    db.question.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    db.question.count({ where }),
    db.question.findMany({ where: base, select: { topic: true }, distinct: ["topic"] }),
  ]);
  const topics = topicRows.map((t) => t.topic).filter(Boolean);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  const href = (o: Partial<SP>) => {
    const m: SP = { category, subject, topic, type, q, ...o };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(m)) if (v) p.set(k, String(v));
    return `?${p.toString()}`;
  };

  const items = rows.map((r) => ({
    id: r.id,
    text: r.text,
    options: r.options as Record<string, string>,
    correct: r.correct,
    explanation: r.explanation,
    category: r.category,
    subject: r.subject,
    topic: r.topic,
    source: r.source,
  }));

  const tab = (on: boolean) =>
    `rounded-lg px-4 py-2 text-sm font-semibold ${on ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`;
  const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link href="/question-builder" className="text-sm text-blue-700">‹ Back</Link>
      <h1 className="mt-2 text-xl font-bold">{[category, subject].filter(Boolean).join(" · ") || "সব প্রশ্ন"}</h1>

      <form method="get" className="mt-4 grid gap-2">
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="subject" value={subject} />
        <input type="hidden" name="type" value={type} />
        <select name="topic" defaultValue={topic} className={input}>
          <option value="">অধ্যায় নির্বাচন করুন</option>
          {topics.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="এখানে খুঁজুন" className={input} />
          <button className="rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">খুঁজুন</button>
        </div>
      </form>

      <p className="mt-4 text-sm font-bold">
        মোট {total ? (page - 1) * PER_PAGE + 1 : 0} - {Math.min(page * PER_PAGE, total)} টি প্রশ্ন (মোট {total})
      </p>

      <div className="mt-2 flex gap-2">
        <Link href={href({ type: "mcq", page: "1" })} className={tab(type === "mcq")}>বহুনির্বাচনি</Link>
        <Link href={href({ type: "written", page: "1" })} className={tab(type === "written")}>লিখিত</Link>
      </div>

      <QbPicker items={items} />

      <nav aria-label="Pagination" className="my-8 flex items-center justify-center gap-4 text-sm">
        {page > 1 && <Link href={href({ page: String(page - 1) })} className="rounded-lg border px-3 py-2">‹ Prev</Link>}
        <span>{page} / {pages}</span>
        {page < pages && <Link href={href({ page: String(page + 1) })} className="rounded-lg border px-3 py-2">Next ›</Link>}
      </nav>
    </main>
  );
}
