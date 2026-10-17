"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Printer, Shuffle, Wand2 } from "lucide-react";

type Item = {
  id: string; text: string; options: Record<string, string>; correct: string;
  explanation: string; category: string; subject: string; topic: string; source: string;
};

const LABELS = {
  bn: ["ক", "খ", "গ", "ঘ"],
  abc: ["a", "b", "c", "d"],
  num: ["১", "২", "৩", "৪"],
  roman: ["i", "ii", "iii", "iv"],
} as const;
type LabelKey = keyof typeof LABELS;

const TOGGLES: [string, string][] = [
  ["title", "টাইটেল"], ["address", "ঠিকানা"], ["cls", "ক্লাসের নাম"], ["subject", "বিষয়ের নাম"],
  ["chapter", "অধ্যায়ের নাম"], ["instr", "নির্দেশনা"], ["examinee", "পরীক্ষার্থীর তথ্য"],
  ["tags", "প্রশ্নের ট্যাগ"], ["marks", "প্রশ্নের মার্ক"], ["omr", "OMR যুক্ত"],
  ["divider", "কলাম ডিভাইডার"], ["subjCode", "বিষয় কোড"], ["obtained", "প্রাপ্ত নম্বর ঘর"],
  ["setCode", "সেট কোড"],
];

const DEF_SHOW: Record<string, boolean> = {
  title: true, address: false, cls: true, subject: true, chapter: true, instr: true,
  examinee: false, tags: false, marks: false, omr: false, divider: true,
  subjCode: false, obtained: false, setCode: true,
};
const DEF_INFO = {
  inst: "", address: "", exam: "", minutes: "", marks: "", code: "",
  instr: "সঠিক উত্তরের বৃত্তটি বল পয়েন্ট কলম দিয়ে ভরাট করো। কাটাকাটি করা যাবে না।",
};
const DEF_CFG = { format: "qa", cols: 2, style: "circle", label: "bn" as LabelKey, optCols: 2 };

const STORE = "qb:selected";
const SETTINGS = "qb:settings";

function rng(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}
function shuffle<T>(arr: T[], seed: number): T[] {
  if (!seed) return arr;
  const r = rng(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const printCss = `
@page { size: A4; margin: 12mm; }
@media print {
  header, footer, nav, .fixed, [data-noprint] { display: none !important; }
  body { background: #fff !important; }
}`;

export default function QbBuilder() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(DEF_SHOW);
  const [info, setInfo] = useState(DEF_INFO);
  const [cfg, setCfg] = useState(DEF_CFG);
  const [setName, setSetName] = useState<"ক" | "খ">("ক");
  const [seed, setSeed] = useState(0);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS);
      if (raw) {
        const o = JSON.parse(raw);
        if (o.show) setShow({ ...DEF_SHOW, ...o.show });
        if (o.info) setInfo({ ...DEF_INFO, ...o.info });
        if (o.cfg) setCfg({ ...DEF_CFG, ...o.cfg });
      }
    } catch {}
    setReady(true);

    let ids: string[] = [];
    try { ids = JSON.parse(localStorage.getItem(STORE) || "[]"); } catch {}
    if (!ids.length) { setLoading(false); return; }
    fetch("/api/qb/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(SETTINGS, JSON.stringify({ show, info, cfg })); } catch {}
  }, [show, info, cfg, ready]);

  const view = useMemo(() => {
    const base = seed ? seed + (setName === "খ" ? 7919 : 0) : setName === "খ" ? 7919 : 0;
    return shuffle(items, base).map((q, i) => {
      const entries = Object.entries(q.options ?? {}).sort(([a], [b]) => a.localeCompare(b));
      const opts = shuffle(entries, base ? base + i + 1 : 0);
      return { q, opts: opts.map(([, v]) => v), ci: opts.findIndex(([k]) => k === q.correct) };
    });
  }, [items, seed, setName]);

  const uniq = (f: (q: Item) => string) =>
    Array.from(new Set(items.map(f).filter(Boolean))).join(", ");

  const autoLayout = () => {
    const max = Math.max(0, ...view.flatMap((v) => v.opts.map((o) => o.length)));
    setCfg({ ...cfg, optCols: max <= 18 ? 4 : max <= 40 ? 2 : 1 });
  };

  const L = LABELS[cfg.label];
  const marked = cfg.format === "qa" || cfg.format === "sug";
  const input = "w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm";
  const chip = (on: boolean) =>
    `rounded-lg border px-3 py-1.5 text-sm ${on ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white"}`;

  function tag(i: number, correct: boolean) {
    const l = L[i];
    if (cfg.style === "circle")
      return (
        <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black text-[11px] ${marked && correct ? "bg-black text-white" : ""}`}>
          {l}
        </span>
      );
    const t = cfg.style === "paren" ? `(${l})` : cfg.style === "close" ? `${l})` : `${l}.`;
    return <span className={`shrink-0 ${marked && correct ? "font-bold underline" : ""}`}>{t}</span>;
  }

  if (loading) return <p className="py-10 text-center">লোড হচ্ছে...</p>;
  if (!items.length)
    return (
      <div className="py-10 text-center">
        <p>কোনো প্রশ্ন নির্বাচন করা হয়নি।</p>
        <Link href="/question-builder" className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white">প্রশ্ন বাছাই করুন</Link>
      </div>
    );

  const isMcq = view.some((v) => v.opts.length > 0);
  const fullMarks = info.marks || String(items.length);
  // উত্তরমালা শুধু "উত্তরপত্র" ফরম্যাটে আসবে
  const showKey = isMcq && cfg.format === "ans";

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <style>{printCss}</style>

      <aside data-noprint className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white">
            <Printer size={16} /> প্রিন্ট / PDF
          </button>
          <Link href="/question-builder/create" className="rounded-lg border px-3 py-2">+ আরও প্রশ্ন যোগ</Link>
        </div>

        <details open className="rounded-xl border bg-white p-3">
          <summary className="cursor-pointer font-semibold">বেসিক সেটিংস</summary>
          <p className="mt-2 text-xs text-slate-500">ফাইল ফরম্যাট</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {[["qa", "প্রশ্ন ও উত্তর"], ["q", "প্রশ্ন"], ["ans", "উত্তরপত্র"], ["sug", "সাজেশন"]].map(([k, l]) => (
              <button key={k} className={chip(cfg.format === k)} onClick={() => setCfg({ ...cfg, format: k })}>{l}</button>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2">
            <input type="checkbox" checked={edit} onChange={(e) => setEdit(e.target.checked)} /> এডিটিং মুড (লেখায় ক্লিক করে বদলান)
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {(["ক", "খ"] as const).map((n) => (
              <button key={n} className={chip(setName === n)} onClick={() => setSetName(n)}>সেট {n}</button>
            ))}
            <button className={chip(false) + " flex items-center gap-1"} onClick={() => setSeed(Math.floor(Math.random() * 1e6) + 1)}>
              <Shuffle size={14} /> এলোমেলো
            </button>
            {seed > 0 && <button className={chip(false)} onClick={() => setSeed(0)}>রিসেট</button>}
          </div>
        </details>

        <details className="rounded-xl border bg-white p-3">
          <summary className="cursor-pointer font-semibold">Page Setup</summary>
          <div className="mt-2 space-y-2">
            <input className={input} placeholder="প্রতিষ্ঠানের নাম" value={info.inst} onChange={(e) => setInfo({ ...info, inst: e.target.value })} />
            <input className={input} placeholder="ঠিকানা" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} />
            <input className={input} placeholder="পরীক্ষার নাম (যেমন: এসএসসি - ২০২৬)" value={info.exam} onChange={(e) => setInfo({ ...info, exam: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <input className={input} placeholder="সময় (মিনিট)" value={info.minutes} onChange={(e) => setInfo({ ...info, minutes: e.target.value })} />
              <input className={input} placeholder="পূর্ণমান" value={info.marks} onChange={(e) => setInfo({ ...info, marks: e.target.value })} />
              <input className={input} placeholder="বিষয় কোড" value={info.code} onChange={(e) => setInfo({ ...info, code: e.target.value })} />
            </div>
            <textarea className={input} rows={3} placeholder="নির্দেশনা" value={info.instr} onChange={(e) => setInfo({ ...info, instr: e.target.value })} />
          </div>
        </details>

        <details className="rounded-xl border bg-white p-3">
          <summary className="cursor-pointer font-semibold">কন্টেন্ট ডিসপ্লে</summary>
          <div className="mt-2 grid gap-1.5">
            {TOGGLES.map(([k, l]) => (
              <label key={k} className="flex items-center justify-between">
                {l}
                <input type="checkbox" checked={!!show[k]} onChange={(e) => setShow({ ...show, [k]: e.target.checked })} />
              </label>
            ))}
          </div>
        </details>

        <details className="rounded-xl border bg-white p-3">
          <summary className="cursor-pointer font-semibold">প্রশ্ন ফরম্যাট</summary>
          <p className="mt-2 text-xs text-slate-500">কলাম সংখ্যা</p>
          <div className="mt-1 flex gap-1.5">
            {[1, 2, 3].map((n) => <button key={n} className={chip(cfg.cols === n)} onClick={() => setCfg({ ...cfg, cols: n })}>{n} কলাম</button>)}
          </div>
          <p className="mt-3 text-xs text-slate-500">অপশন স্টাইল</p>
          <div className="mt-1 flex gap-1.5">
            {[["circle", "(ক) গোল"], ["dot", "ক."], ["paren", "(ক)"], ["close", "ক)"]].map(([k, l]) => (
              <button key={k} className={chip(cfg.style === k)} onClick={() => setCfg({ ...cfg, style: k })}>{l}</button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">অপশন লেবেল</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {([["bn", "ক খ গ"], ["abc", "a b c"], ["num", "১ ২ ৩"], ["roman", "i ii iii"]] as [LabelKey, string][]).map(([k, l]) => (
              <button key={k} className={chip(cfg.label === k)} onClick={() => setCfg({ ...cfg, label: k })}>{l}</button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">অপশন কলাম সংখ্যা</p>
          <div className="mt-1 flex gap-1.5">
            {[1, 2, 3, 4].map((n) => <button key={n} className={chip(cfg.optCols === n)} onClick={() => setCfg({ ...cfg, optCols: n })}>{n}</button>)}
            <button className={chip(false) + " flex items-center gap-1"} onClick={autoLayout}><Wand2 size={14} /> অটো</button>
          </div>
        </details>
      </aside>

      <section className="overflow-x-auto">
        <div id="paper" className="mx-auto w-full max-w-[820px] bg-white p-6 text-black shadow print:max-w-none print:p-0 print:shadow-none">
          <div className="text-center">
            {show.title && <h2 className="text-lg font-bold" contentEditable={edit} suppressContentEditableWarning>{info.inst || "প্রতিষ্ঠানের নাম"}</h2>}
            {show.address && info.address && <p className="text-xs">{info.address}</p>}
            {info.exam && <p className="text-sm">{info.exam}</p>}
            {show.cls && uniq((q) => q.category) && <p className="text-sm">শ্রেণি: {uniq((q) => q.category)}</p>}
            {show.subject && uniq((q) => q.subject) && <p className="text-sm">বিষয়: {uniq((q) => q.subject)}</p>}
            {show.chapter && uniq((q) => q.topic) && <p className="text-sm">অধ্যায়: {uniq((q) => q.topic)}</p>}
          </div>

          <div className="mt-2 flex items-start justify-between text-xs">
            <span>{info.minutes ? `সময়— ${info.minutes} মিনিট` : ""} {show.subjCode && info.code ? `· বিষয় কোড: ${info.code}` : ""}</span>
            <span className="flex items-center gap-2">
              {show.setCode && <span className="border border-black px-2 py-0.5">সেট: {setName}</span>}
              <span>পূর্ণমান— {fullMarks}</span>
              {show.obtained && <span className="border border-black px-3 py-0.5">প্রাপ্ত:</span>}
            </span>
          </div>

          {show.examinee && (
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <span className="border-b border-black">নাম:</span>
              <span className="border-b border-black">রোল:</span>
              <span className="border-b border-black">শাখা:</span>
            </div>
          )}
          {show.instr && info.instr && <p className="mt-2 border-y border-black py-1 text-center text-[11px] italic">{info.instr}</p>}

          {cfg.format !== "ans" && (
            <div
              className="mt-3"
              style={{
                columnCount: cfg.cols,
                columnGap: "20px",
                columnRule: show.divider && cfg.cols > 1 ? "1px solid #888" : undefined,
              }}
            >
              {view.map(({ q, opts, ci }, i) => (
                <div key={q.id} style={{ breakInside: "avoid" }} className="mb-3 text-[13px] leading-snug">
                  <div className="flex justify-between gap-2">
                    <p contentEditable={edit} suppressContentEditableWarning><b>{i + 1}.</b> {q.text}</p>
                    {show.marks && <span className="shrink-0 text-xs">[১]</span>}
                  </div>
                  {opts.length > 0 && (
                    <div className="mt-1 grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: `repeat(${cfg.optCols}, minmax(0, 1fr))` }}>
                      {opts.map((o, k) => (
                        <p key={k} className="flex items-start gap-1.5">
                          {tag(k, k === ci)}
                          <span contentEditable={edit} suppressContentEditableWarning>{o}</span>
                        </p>
                      ))}
                    </div>
                  )}
                  {show.tags && (
                    <p className="mt-1 text-[10px] text-slate-600">
                      {[q.category, q.subject, q.topic, q.source].filter(Boolean).map((t) => `[${t}]`).join(" ")}
                    </p>
                  )}
                  {cfg.format === "sug" && q.explanation && (
                    <p className="mt-1 text-[11px] text-slate-700">ব্যাখ্যা: {q.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {showKey && (
            <div className="mt-4 border-t border-black pt-2">
              <p className="text-sm font-bold">উত্তরমালা: সেট {setName}</p>
              <div className="mt-1 grid grid-cols-5 gap-x-3 gap-y-0.5 text-xs">
                {view.map((v, i) => v.ci >= 0 && <span key={i}>{i + 1}. {L[v.ci]}</span>)}
              </div>
            </div>
          )}

          {show.omr && isMcq && (
            <div
              className="mt-4 border-t border-black pt-2 print:mt-0 print:border-0 print:pt-0"
              style={{ breakBefore: "page", pageBreakBefore: "always" }}
            >
              <p className="text-sm font-bold">OMR</p>
              <div className="mt-1 grid grid-cols-5 gap-x-2 gap-y-1 text-[10px]">
                {view.map((_, i) => (
                  <div key={i} className="flex items-center gap-0.5">
                    <span className="w-5 text-right">{i + 1}</span>
                    {LABELS.bn.map((l) => (
                      <span key={l} className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-black text-[8px]">{l}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
                                    }
