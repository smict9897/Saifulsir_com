"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, Loader2, Sparkles } from "lucide-react";
import { generateQuiz, saveQuizToBank, type QuizItem } from "@/app/actions/generate-quiz";

type Triple = { category: string; subject: string; topic: string };
type Meta = { subject: string; category: string; topic: string; difficulty: "Easy" | "Medium" | "Hard"; lang: "Bangla" | "English" };

const BASE_CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "SSC", "HSC", "Admission", "Job"];
const OTHER = "__other__";
const BN = ["ক", "খ", "গ", "ঘ"];
const uniq = (a: string[]) => Array.from(new Set(a.filter(Boolean)));
const classLabel = (v: string) => (/^\d+$/.test(v) ? `ক্লাস ${v}` : v);
const f = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2";

export default function QuizBox({ triples = [] }: { triples?: Triple[] }) {
  const router = useRouter();
  const classes = useMemo(() => uniq([...BASE_CLASSES, ...triples.map((t) => t.category)]), [triples]);

  const [cat, setCat] = useState("");
  const [subjSel, setSubjSel] = useState("");
  const [subjOther, setSubjOther] = useState("");
  const [topSel, setTopSel] = useState("");
  const [topOther, setTopOther] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [count, setCount] = useState(10);
  const [lang, setLang] = useState<"Bangla" | "English">("Bangla");

  const [items, setItems] = useState<QuizItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [picked, setPicked] = useState<Record<number, string>>({});
  const [savedIds, setSavedIds] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const subjects = useMemo(
    () => uniq(triples.filter((t) => t.category === cat).map((t) => t.subject)),
    [triples, cat],
  );
  const subjIsOther = subjSel === OTHER || (cat !== "" && subjects.length === 0);
  const subject = subjIsOther ? subjOther.trim() : subjSel;

  const topics = useMemo(
    () => (subjIsOther ? [] : uniq(triples.filter((t) => t.category === cat && t.subject === subjSel).map((t) => t.topic))),
    [triples, cat, subjSel, subjIsOther],
  );
  const topIsOther = topSel === OTHER || (subject !== "" && topics.length === 0);
  const topic = topIsOther ? topOther.trim() : topSel;

  async function generate() {
    setError("");
    setSavedIds(null);
    setPicked({});
    setItems([]);
    if (!cat || !subject || !topic) {
      setError("ক্লাস, বিষয় ও অধ্যায় তিনটিই দিন।");
      return;
    }
    setLoading(true);
    try {
      const r = await generateQuiz({ subject, category: cat, topic, difficulty, count, lang });
      if (r.ok) {
        setItems(r.items);
        setMeta({ subject, category: cat, topic, difficulty, lang });
      } else {
        setError(r.error);
      }
    } catch {
      setError("প্রশ্ন তৈরি হয়নি। আবার চেষ্টা করুন।");
    }
    setLoading(false);
  }

  async function makePaper() {
    if (!meta || !items.length) return;
    setError("");
    let ids = savedIds;
    if (!ids) {
      setSaving(true);
      try {
        const r = await saveQuizToBank({ ...meta, items });
        if (!r.ok) {
          setError(r.error);
          setSaving(false);
          return;
        }
        ids = r.ids;
        setSavedIds(ids);
      } catch {
        setError("সেভ হয়নি। আবার চেষ্টা করুন।");
        setSaving(false);
        return;
      }
      setSaving(false);
    }
    try {
      localStorage.setItem("qb:selected", JSON.stringify(ids));
    } catch {}
    router.push("/question-builder/build");
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void generate();
        }}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <label className="grid gap-1 text-sm font-medium">
          <span>ক্লাস</span>
          <select
            value={cat}
            onChange={(e) => {
              setCat(e.target.value);
              setSubjSel("");
              setSubjOther("");
              setTopSel("");
              setTopOther("");
            }}
            className={f}
          >
            <option value="">ক্লাস বাছুন</option>
            {classes.map((c) => (
              <option key={c} value={c}>{classLabel(c)}</option>
            ))}
          </select>
        </label>

        <div className="grid gap-1 text-sm font-medium">
          <span>বিষয়</span>
          {!cat ? (
            <select disabled className={f}><option>আগে ক্লাস বাছুন</option></select>
          ) : (
            <>
              {subjects.length > 0 && (
                <select
                  value={subjSel}
                  onChange={(e) => {
                    setSubjSel(e.target.value);
                    setSubjOther("");
                    setTopSel("");
                    setTopOther("");
                  }}
                  className={f}
                >
                  <option value="">বিষয় বাছুন</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value={OTHER}>অন্য (নিজে লিখুন)</option>
                </select>
              )}
              {subjIsOther && (
                <input value={subjOther} onChange={(e) => setSubjOther(e.target.value)} placeholder="বিষয়ের নাম লিখুন" className={f} />
              )}
            </>
          )}
        </div>

        <div className="grid gap-1 text-sm font-medium">
          <span>অধ্যায়</span>
          {!subject ? (
            <select disabled className={f}><option>আগে বিষয় দিন</option></select>
          ) : (
            <>
              {topics.length > 0 && (
                <select
                  value={topSel}
                  onChange={(e) => {
                    setTopSel(e.target.value);
                    setTopOther("");
                  }}
                  className={f}
                >
                  <option value="">অধ্যায় বাছুন</option>
                  {topics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value={OTHER}>অন্য (নিজে লিখুন)</option>
                </select>
              )}
              {topIsOther && (
                <input value={topOther} onChange={(e) => setTopOther(e.target.value)} placeholder="অধ্যায়ের নাম লিখুন" className={f} />
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <label className="grid gap-1 text-sm font-medium">
            <span>কঠিনতা</span>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")} className={f}>
              <option value="Easy">সহজ</option>
              <option value="Medium">মাঝারি</option>
              <option value="Hard">কঠিন</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            <span>প্রশ্ন সংখ্যা</span>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
              className={f}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            <span>ভাষা</span>
            <select value={lang} onChange={(e) => setLang(e.target.value as "Bangla" | "English")} className={f}>
              <option value="Bangla">বাংলা</option>
              <option value="English">English</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {loading ? "প্রশ্ন তৈরি হচ্ছে…" : "এক ক্লিকে প্রশ্ন তৈরি করুন"}
        </button>
      </form>

      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}

      {items.length > 0 && (
        <div className="mt-5 grid gap-4">
          <p className="text-sm text-slate-600">{items.length} টি প্রশ্ন তৈরি হয়েছে</p>
          <button
            type="button"
            onClick={() => void makePaper()}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <FilePlus2 size={18} />}
            {saving ? "সেভ হচ্ছে…" : "প্রশ্নপত্র তৈরি করুন"}
          </button>

          {items.map((q, i) => {
            const chosen = picked[i];
            return (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-semibold">{i + 1}. {q.text}</p>
                <div className="mt-2 grid gap-2">
                  {(["A", "B", "C", "D"] as const).map((k, j) => {
                    const isCorrect = k === q.correct;
                    const isChosen = chosen === k;
                    const cls = chosen
                      ? isCorrect
                        ? "border-emerald-600 bg-emerald-50"
                        : isChosen
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200"
                      : "border-slate-300 hover:bg-slate-50";
                    return (
                      <button
                        key={k}
                        type="button"
                        disabled={!!chosen}
                        onClick={() => setPicked((p) => ({ ...p, [i]: k }))}
                        className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm ${cls}`}
                      >
                        <b>{BN[j]}.</b>
                        <span>{q.options[k]}</span>
                      </button>
                    );
                  })}
                </div>
                {chosen && q.explanation && (
                  <p className="mt-2 rounded-lg bg-slate-50 p-2 text-sm text-slate-700">{q.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
        }
