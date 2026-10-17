import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { addQuestion, importQuestions, deleteQuestion, toggleApproved } from "./actions";

export const dynamic = "force-dynamic";

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "SSC", "HSC", "Admission", "Job"];
const PER_PAGE = 20;
const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700";
const btn = "rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white";

function Common() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <select name="category" className={input} required>
        {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <input name="subject" placeholder="বিষয় (যেমন: গণিত)" className={input} required />
      <input name="topic" placeholder="অধ্যায়" className={input} />
      <input name="source" placeholder="বোর্ড-সাল (যেমন: ঢাকা বোর্ড ২০২৬)" className={input} />
      <select name="difficulty" className={input} defaultValue="MEDIUM">
        <option value="EASY">Easy</option>
        <option value="MEDIUM">Medium</option>
        <option value="HARD">Hard</option>
      </select>
      <select name="lang" className={input}>
        <option value="Bangla">Bangla</option>
        <option value="English">English</option>
      </select>
    </div>
  );
}

export default async function AdminQuestions({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "TEACHER") redirect("/");

  const { page: p } = await searchParams;
  const page = Math.max(1, Number(p) || 1);

  const [rows, total] = await Promise.all([
    db.question.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    db.question.count(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-bold">প্রশ্ন ব্যাংক ({total})</h1>

      <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <h2 className="mb-3 font-semibold">একটি প্রশ্ন যোগ করুন</h2>
        <form action={addQuestion} className="space-y-2">
          <Common />
          <select name="type" className={input} defaultValue="MCQ">
            <option value="MCQ">বহুনির্বাচনি (MCQ)</option>
            <option value="WRITTEN">লিখিত</option>
          </select>
          <textarea name="text" placeholder="প্রশ্ন" rows={3} className={input} required />
          <div className="grid grid-cols-2 gap-2">
            {["A", "B", "C", "D"].map((k) => (
              <input key={k} name={k} placeholder={`অপশন ${k} (MCQ হলে)`} className={input} />
            ))}
          </div>
          <select name="correct" className={input} defaultValue="A">
            {["A", "B", "C", "D"].map((k) => <option key={k} value={k}>সঠিক উত্তর: {k}</option>)}
          </select>
          <textarea name="explanation" placeholder="ব্যাখ্যা (ঐচ্ছিক)" rows={2} className={input} />
          <button className={btn}>যোগ করুন</button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <h2 className="mb-1 font-semibold">একসাথে অনেক MCQ ইমপোর্ট</h2>
        <p className="mb-3 text-xs text-slate-500">
          প্রতি লাইনে একটি প্রশ্ন, আলাদা করুন | দিয়ে: প্রশ্ন | A | B | C | D | সঠিক (A-D) | ব্যাখ্যা
        </p>
        <form action={importQuestions} className="space-y-2">
          <Common />
          <textarea
            name="bulk"
            rows={6}
            className={input}
            placeholder="CMOS এর পূর্ণরূপ কী? | Computer Metal-Oxide Semiconductor | Connection ... | Contrast ... | Complementary Metal-Oxide Semiconductor | D | ..."
          />
          <button className={btn}>ইমপোর্ট করুন</button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-semibold">সাম্প্রতিক প্রশ্ন</h2>
        <ul className="space-y-3">
          {rows.map((q) => (
            <li key={q.id} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
              <p className="font-medium">{q.text}</p>
              <p className="mt-1 text-xs text-slate-500">
                {q.category} · {q.subject} · {q.topic} · {q.source} · {q.approved ? "অনুমোদিত" : "অপেক্ষমাণ"}
              </p>
              <div className="mt-2 flex gap-2">
                <form action={toggleApproved.bind(null, q.id)}>
                  <button className="rounded border px-2 py-1 text-xs">
                    {q.approved ? "অনুমোদন তুলুন" : "অনুমোদন দিন"}
                  </button>
                </form>
                <form action={deleteQuestion.bind(null, q.id)}>
                  <button className="rounded border border-red-300 px-2 py-1 text-xs text-red-600">মুছুন</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link href={`?page=${page - 1}`}>‹ Prev</Link>}
          <span>{page} / {pages}</span>
          {page < pages && <Link href={`?page=${page + 1}`}>Next ›</Link>}
        </div>
      </section>
    </main>
  );
}
