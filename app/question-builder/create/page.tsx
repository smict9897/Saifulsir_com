import Link from "next/link";
import { db } from "@/lib/db";
import QbPicker from "@/components/qb-picker";

export const dynamic = "force-dynamic";
export const metadata = { title: "প্রশ্ন নির্বাচন" };

type SP = { category?: string; subject?: string; topic?: string; q?: string; page?: string };
const PER_PAGE = 50;

export default async function CreatePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const category = sp.category ?? "";
  const subject = sp.subject ?? "";
  const topic = sp.topic ?? "";
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page) || 1);

  const where = {
    approved: true,
    ...(category ? { category } : {}),
    ...(subject ? { subject } : {}),
    ...(topic ? { topic } : {}),
    ...(q ? { text: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [rows, total, topicRows] = await Promise.all([
    db.question.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    db.question.count({ where }),
    db.question.findMany({ where: { approved: true, ...(category ? { category } : {}) }, select: { topic: true }, distinct: ["topic"] }),
  ]);
  
  const topics = topicRows.map((t) => t.topic).filter(Boolean);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  const href = (o: Partial<SP>) => {
    const m: SP = { category, subject, topic, q, ...o };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(m)) if (v) p.set(k, String(v));
    return `?${p.toString()}`;
  };

  const items = rows.map((r) => {
    // 🎯 সঠিকভাবে MCQ, SHORT এবং CQ ডিটেক্ট করার লজিক
    let itemType = "MCQ";
    const opts = (r.options as any) || {};
    
    if (!r.correct) {
      // যদি অপশনে উদ্দীপক বা ক/খ/গ/ঘ থাকে, তবেই সেটি CQ, অন্যথায় SHORT
      const isCq = opts.stimulus || opts.k || opts.ক || opts.subQuestions || (r.text && r.text.includes("(ক)"));
      itemType = isCq ? "CQ" : "SHORT";
    }
    
    return {
      id: r.id,
      text: r.text,
      options: opts,
      correct: r.correct,
      explanation: r.explanation,
      category: r.category,
      subject: r.subject,
      topic: r.topic,
      source: r.source,
      type: itemType, // 🎯 এখানে টাইপটি পাস করা হলো
      stimulus: opts.stimulus || "",
      subQuestions: itemType === "CQ" ? opts : undefined,
    };
  });

  const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link href="/question-builder" className="text-sm text-blue-700">‹ Back</Link>
      <h1 className="mt-2 text-xl font-bold">{[category, subject].filter(Boolean).join(" · ") || "সব প্রশ্ন"}</h1>

      <form method="get" className="mt-4 grid gap-2">
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="subject" value={subject} />
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

      <QbPicker items={items} />

      <nav aria-label="Pagination" className="my-8 flex items-center justify-center gap-4 text-sm">
        {page > 1 && <Link href={href({ page: String(page - 1) })} className="rounded-lg border px-3 py-2">‹ Prev</Link>}
        <span>{page} / {pages}</span>
        {page < pages && <Link href={href({ page: String(page + 1) })} className="rounded-lg border px-3 py-2">Next ›</Link>}
      </nav>
    </main>
  );
}
