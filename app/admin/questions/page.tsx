import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { addQuestion, importQuestions, deleteQuestion, toggleApproved } from "./actions";
import AdminQuestionMeta from "@/components/admin-question-meta";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;
const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700";
const btn = "rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white";

const QUICK: [string, string, string][] = [
  ["/admin/questions/manage", "প্রশ্ন ম্যানেজ", "গণনা, ফিল্টার, অনুমোদন ও মোছা"],
  ["/admin/questions", "প্রশ্ন ব্যাংক", "সব প্রশ্ন দেখুন ও যোগ করুন"],
  ["/question-builder", "প্রশ্নপত্র তৈরি", "প্রশ্ন বেছে প্রশ্নপত্র বানান"],
  ["/question-builder/saved", "সংরক্ষিত প্রশ্নপত্র", "আগে সেভ করা প্রশ্নপত্র"],
  ["/admin/questions/extract", "ইমপোর্ট প্রশ্ন", "PDF বা ছবি থেকে প্রশ্ন তুলুন"],
];

export default async function AdminQuestions({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; err?: string; ok?: string }>;
}) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "TEACHER") redirect("/");

  const { page: p, err, ok } = await searchParams;
  const page = Math.max(1, Number(p) || 1);

  const [rows, total] = await Promise.all([
    db.question.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    db.question.count(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-bold">প্রশ্ন ব্যাংক ({total})</h1>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 font-semibold">প্রশ্ন ব্যাংক মেনু</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {QUICK.map(([href, title, sub]) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl border border-slate-200 p-3 transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
            </Link>
          ))}
        </div>
      </section>

      {err && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      {ok && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{ok}</p>}

      <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <h2 className="mb-3 font-semibold">একটি প্রশ্ন যোগ করুন</h2>
        <form action={addQuestion} className="space-y-2">
          <AdminQuestionMeta />
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
            {["A", "B", "C", "D"].map((k) => (
              <option key={k} value={k}>
                সঠিক উত্তর: {k}
              </option>
            ))}
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
          <AdminQuestionMeta />
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
          <span>
            {page} / {pages}
          </span>
          {page < pages && <Link href={`?page=${page + 1}`}>Next ›</Link>}
        </div>
      </section>
    </main>
  );
}
