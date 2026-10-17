"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

export type QItem = {
  id: string; text: string; options: Record<string, string>; correct: string;
  explanation: string; category: string; subject: string; topic: string; source: string;
};

const KEY = "qb:selected";

export default function QbPicker({ items }: { items: QItem[] }) {
  const [sel, setSel] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSel(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(sel)); } catch {}
  }, [sel, ready]);

  const ids = items.map((i) => i.id);
  const allOnPage = ids.length > 0 && ids.every((id) => sel.includes(id));
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const togglePage = () =>
    setSel((s) => (allOnPage ? s.filter((id) => !ids.includes(id)) : Array.from(new Set([...s, ...ids]))));

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 rounded-lg border border-dashed border-slate-400 px-3 py-2 text-sm">
          <input type="checkbox" checked={allOnPage} onChange={togglePage} />
          সব নির্বাচন (এই পাতা)
        </label>
        <Link href="/question-builder/build" className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900">
          নির্বাচিত প্রশ্ন দেখুন ({sel.length})
        </Link>
        <button type="button" onClick={() => setSel([])} className="rounded-lg bg-pink-600 px-3 py-2 text-sm font-semibold text-white">
          সব মুছুন
        </button>
      </div>

      {!items.length && <p className="mt-6 text-slate-600">কোনো প্রশ্ন পাওয়া যায়নি।</p>}

      <ol className="mt-4 grid gap-4">
        {items.map((q, i) => {
          const on = sel.includes(q.id);
          const opts = Object.entries(q.options ?? {}).sort(([a], [b]) => a.localeCompare(b));
          return (
            <li key={q.id} className={`rounded-xl border bg-white p-4 text-sm ${on ? "border-blue-600" : "border-slate-200"}`}>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={on} onChange={() => toggle(q.id)} className="mt-1" />
                <span className="font-medium">{i + 1}. {q.text}</span>
              </label>

              {opts.length > 0 && (
                <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {opts.map(([k, v]) => (
                    <p key={k} className="flex items-start gap-2">
                      {k === q.correct
                        ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-600" />
                        : <Circle size={18} className="mt-0.5 shrink-0 text-slate-400" />}
                      <span>{v}</span>
                    </p>
                  ))}
                </div>
              )}

              <p className="mt-3 flex flex-wrap gap-1.5 text-xs">
                {[q.category, q.subject, q.topic, q.source].filter(Boolean).map((t, j) => (
                  <span key={j} className="rounded bg-amber-50 px-2 py-0.5">[{t}]</span>
                ))}
              </p>

              {q.explanation && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-semibold">ব্যাখ্যা</summary>
                  <p className="mt-1 text-slate-700">{q.explanation}</p>
                </details>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
