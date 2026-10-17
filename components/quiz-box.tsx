"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, FilePlus2 } from "lucide-react";
import { generateQuiz, saveQuizToBank, type QuizItem } from "@/app/actions/generate-quiz";

type Triple = { category: string; subject: string; topic: string };
type Meta = { subject: string; category: string; topic: string; difficulty: string; lang: string };

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "SSC", "HSC", "Admission", "Job"];
const OTHER = "__other";
const field = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm";
const uniq = (a: string[]) => Array.from(new Set(a.filter(Boolean)));

export default function QuizBox({ triples = [] }: { triples?: Triple[] }) {
  const router = useRouter();
  const [category, setCategory] = useState("HSC");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [count, setCount] = useState("5");
  const [lang, setLang] = useState("Bangla");

  const [items, setItems] = useState<QuizItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [savedIds, setSavedIds] = useState<string[] | null>(null);
  const [picked, setPicked] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [saving, startSave] = useTransition();

  const subjects = useMemo(
    () => uniq(triples.filter((t) => t.category === category).map((t) => t.subject)),
    [triples, category],
  );
  const topics = useMemo(
    () => uniq(triples.filter((t) => t.category === category && t.subject === subject).map((t) => t.topic)),
    [triples, category, subject],
  );

  const subjectCustom = subject === OTHER || subjects.length === 0;
  const topicCustom = subjectCustom || topic === OTHER || topics.length === 0;
  const subjectVal = (subjectCustom ? customSubject : subject).trim();
  const topicVal = (topicCustom ? customTopic : topic).trim();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setPicked({}); setSavedIds(null);
    if (!subjectVal) { setError("বিষয় দিন।"); return; }
    if (!topicVal) { setError("অধ্যায় দিন।"); return; }
    const genCategory = /^\d+$/.test(category) ? `Class ${category}` : category;
    const m: Meta = { subject: subjectVal, category, topic: topicVal, difficulty, lang };
    start(async () => {
      const r = await generateQuiz({ subject: subjectVal, category: genCategory, topic: topicVal, difficulty, count, lang });
      if (r.ok) { setItems(r.items); setMeta(m); } else setError(r.error);
    });
  }

  function openBuilder(ids: string[]) {
    try { localStorage.setItem("qb:selected", JSON.stringify(ids)); } catch {}
    router.push("/question-builder/build");
  }

  function makePaper() {
    if (!meta || !items.length) return;
    setError("");
    if (savedIds) { openBuilder(savedIds); return; }
    startSave(async () => {
      const r = await saveQuizToBank({ ...meta, items });
      if (!r.ok) { setError(r.error); return; }
      setSavedIds(r.ids);
      openBuilder(r.ids);
    });
  }

  return (
    <div className="rounded-xl bg-white p-5 text-navy-900 shadow-xl">
      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setSubject(""); setTopic(""); }}
          className={`${field} col-span-2`}
          aria-label="ক্লাস"
        >
          {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {subjects.length > 0 && (
          <select
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setTopic(""); }}
            className={`${field} col-span-2`}
            aria-label="বিষয়"
          >
            <option value="">বিষয় বেছে নিন</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            <option value={OTHER}>অন্য বিষয় (নিজে লিখুন)</option>
          </select>
        )}
        {subjectCustom && (
          <input
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            placeholder="বিষয় লিখুন (যেমন: গণিত)"
            className={`${field} col-span-2`}
          />
        )}

        {!subjectCustom && subject && topics.length > 0 && (
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={`${field} col-span-2`}
            aria-label="অধ্যায়"
          >
            <option value="">অধ্যায় বেছে নিন</option>
            {topics.map((t) => <option key={t} value={t}>{t}</option>)}
            <option value={OTHER}>অন্য অধ্যায় (নিজে লিখুন)</option>
          </select>
        )}
        {topicCustom && (
          <input
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="অধ্যায় লিখুন (যেমন: ভেক্টর)"
            className={`${field} col-span-2`}
          />
        )}

        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={field} aria-label="কঠিনতা">
          <option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
        <select value={count} onChange={(e) => setCount(e.target.value)} className={field} aria-label="প্রশ্নের সংখ্যা">
          <option>5</option><option>10</option><option>20</option>
        </select>
        <select value={lang} onChange={(e) => setLang(e.target.value)} className={`${field} col-span-2`} aria-label="ভাষা">
          <option>Bangla</option><option>English</option>
        </select>
        <button disabled={pending} className="col-span-2 flex items-center justify-center gap-2 rounded-md bg-royal px-4 py-2.5 font-medium text-white disabled:opacity-60">
          <Sparkles size={16} /> {pending ? "তৈরি হচ্ছে…" : "এক ক্লিকে প্রশ্ন তৈরি করুন"}
        </button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}

      {items.length > 0 && (
        <button
          type="button"
          onClick={makePaper}
          disabled={saving}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          <FilePlus2 size={18} /> {saving ? "অপেক্ষা করুন…" : "প্রশ্নপত্র তৈরি করুন"}
        </button>
      )}

      <ol className="mt-4 space-y-4">
        {items.map((q, i) => (
          <li key={i} className="text-sm">
            <p className="font-medium">{i + 1}. {q.text}</p>
            <div className="mt-2 grid gap-1.5">
              {(Object.entries(q.options) as [string, string][]).map(([k, v]) => {
                const chosen = picked[i]; const ok = k === q.correct;
                return (
                  <button key={k} type="button" disabled={!!chosen} onClick={() => setPicked({ ...picked, [i]: k })}
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
