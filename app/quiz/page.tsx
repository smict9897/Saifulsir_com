import Link from "next/link";
import { FilePlus2, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import QuizBox from "@/components/quiz-box";
import Practice, { type Q } from "@/components/practice";
export const dynamic = "force-dynamic";
export default async function QuizPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const { subject } = await searchParams;
  const rows = await db.question.findMany({ where: { approved: true, ...(subject ? { subject } : {}) }, take: 50 }).catch(() => []);
  const qs: Q[] = rows.sort(() => Math.random() - 0.5).slice(0, 10).map((r) => ({ id: r.id, text: r.text, options: r.options as Record<string, string>, correct: r.correct, explanation: r.explanation }));
  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-4 py-10 lg:grid-cols-2">
      <Link
        href="/question-builder"
        className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-lg lg:col-span-2"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <FilePlus2 size={28} />
        </span>
        <span className="flex-1">
          <span className="block text-xl font-bold">প্রশ্ন পত্র তৈরি করুন</span>
          <span className="block text-sm text-white/90">ক্লাস ও বিষয় বেছে ১ ক্লিকে প্রশ্নপত্র বানান, PDF নামান</span>
        </span>
        <ArrowRight size={24} />
      </Link>
      <section><h1 className="mb-4 text-2xl font-bold">Make your own AI quiz</h1><QuizBox /></section>
      <section><h2 className="mb-4 text-2xl font-bold">Practice from the question bank</h2>
        {qs.length ? <Practice qs={qs} /> : <p className="text-slate-600">No approved questions yet.</p>}</section>
    </main>
  );
}
