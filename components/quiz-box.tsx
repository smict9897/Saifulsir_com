"use client";
import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { generateQuiz, type QuizItem } from "@/app/actions/generate-quiz";

const field = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm";
export default function QuizBox() {
  const [items, setItems] = useState<QuizItem[]>([]);
  const [picked, setPicked] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function onSubmit(fd: FormData) {
    setError(""); setPicked({});
    start(async () => {
      const r = await generateQuiz(Object.fromEntries(fd));
      if (r.ok) setItems(r.items); else setError(r.error);
    });
  }
  return (
    <div className="rounded-xl bg-white p-5 text-navy-900 shadow-xl">
      <form action={onSubmit} className="grid grid-cols-2 gap-3">
        <select name="subject" className={field}><option>Math</option><option>Physics</option><option>English</option><option>NTRCA</option><option>BCS</option></select>
        <input name="category" className={field} placeholder="Class / category" defaultValue="HSC" />
        <input name="topic" className={`${field} col-span-2`} placeholder="Topic, e.g. Vectors" required />
        <select name="difficulty" className={field}><option>Easy</option><option>Medium</option><option>Hard</option></select>
        <select name="count" className={field}><option>5</option><option>10</option><option>20</option></select>
        <select name="lang" className={`${field} col-span-2`}><option>Bangla</option><option>English</option></select>
        <button disabled={pending} className="col-span-2 flex items-center justify-center gap-2 rounded-md bg-royal px-4 py-2.5 font-medium text-white disabled:opacity-60">
          <Sparkles size={16} /> {pending ? "Generating…" : "Generate quiz with AI"}
        </button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <ol className="mt-4 space-y-4">
        {items.map((q, i) => (
          <li key={i} className="text-sm">
            <p className="font-medium">{i + 1}. {q.text}</p>
            <div className="mt-2 grid gap-1.5">
              {(Object.entries(q.options) as [string, string][]).map(([k, v]) => {
                const chosen = picked[i]; const ok = k === q.correct;
                return (
                  <button key={k} disabled={!!chosen} onClick={() => setPicked({ ...picked, [i]: k })}
                    className={`rounded-md border px-3 py-1.5 text-left ${chosen && ok ? "border-green-600 bg-green-50" : chosen === k ? "border-red-500 bg-red-50" : "border-slate-200"}`}>
                    {k}. {v}
                  </button>
                );
              })}
            </div>
            {picked[i] && <p className="mt-2 rounded-md bg-slate-50 p-2 text-slate-700">{q.explanation}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
