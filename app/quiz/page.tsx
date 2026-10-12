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
      <section><h1 className="mb-4 text-2xl font-bold">Make your own AI quiz</h1><QuizBox /></section>
      <section><h2 className="mb-4 text-2xl font-bold">Practice from the question bank</h2>
        {qs.length ? <Practice qs={qs} /> : <p className="text-slate-600">No approved questions yet.</p>}</section>
    </main>
  );
}
