"use client";
import { useMemo, useState, useRef } from "react";
import Link from "next/link";
import { 
  FileUp, Loader2, CheckCircle2, AlertCircle, Save, 
  Layers, CheckSquare, Square, Trash2, Edit3 
} from "lucide-react";
import curriculum from "../nctb-curriculum.json";
import MathText from "@/components/MathText";

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "SSC", "HSC", "Admission", "Job"];
const OTHER = "__other__";
const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700";

const CLASS_MAP: Record<string, string> = {
  "6": "Class 6",
  "7": "Class 7",
  "8": "Class 8",
  "SSC": "Class 9-10",
  "HSC": "Class 11-12",
};

function getCurriculumSubjects(cat: string): string[] {
  const key = CLASS_MAP[cat];
  if (!key) return [];
  const cls = curriculum.classes.find((c) => c.class === key);
  return cls ? cls.subjects.map((s) => s.name) : [];
}

function getCurriculumChapters(cat: string, subject: string): string[] {
  const key = CLASS_MAP[cat];
  if (!key) return [];
  const cls = curriculum.classes.find((c) => c.class === key);
  if (!cls) return [];
  const sub = cls.subjects.find((s) => s.name === subject);
  return sub ? sub.chapters : [];
}

// 🎯 ব্রাউজারে ২-কলাম PDF টেক্সট রিডার (কোনো এক্সটার্নাল প্যাকেজ ছাড়া)
async function loadAndExtractPdf(file: File): Promise<string> {
  if (typeof window === "undefined") return "";

  // PDF.js ব্রাউজারে ডায়নামিক লোড করা
  const pdfjsLib: any = await new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) return resolve((window as any).pdfjsLib);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(lib);
    };
    script.onerror = () => reject(new Error("PDF.js লোড করতে ব্যর্থ"));
    document.head.appendChild(script);
  });

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();
    const midX = viewport.width / 2;

    // ২-কলাম লেআউট ফিল্টার: বাম কলাম (x < midX) এবং ডান কলাম (x >= midX)
    const col1Items: any[] = [];
    const col2Items: any[] = [];

    textContent.items.forEach((item: any) => {
      const x = item.transform[4];
      if (x < midX - 10) col1Items.push(item);
      else col2Items.push(item);
    });

    // উপর থেকে নিচে (y অক্ষ দিয়ে) সর্ট করা
    const sortByY = (a: any, b: any) => b.transform[5] - a.transform[5];
    col1Items.sort(sortByY);
    col2Items.sort(sortByY);

    const col1Text = col1Items.map((i: any) => i.str).join(" ");
    const col2Text = col2Items.map((i: any) => i.str).join(" ");

    fullText += `\n${col1Text}\n${col2Text}\n`;
  }

  return fullText;
}

// 🎯 ৩-সেকশন পার্সার (MCQ + সংক্ষিপ্ত + সৃজনশীল)
function parseQuestionsAlgorithm(rawText: string) {
  const mcqs: any[] = [];
  const shorts: any[] = [];
  const cqs: any[] = [];

  if (!rawText) return { mcqs, shorts, cqs };

  const clean = (s: string) => s.replace(/\s+/g, " ").trim();

  let mcqPart = "";
  let shortPart = "";
  let cqPart = "";

  const shortIndex = rawText.search(/(?:সংক্ষিপ্ত\s*উত্তর\s*প্রশ্ন|সংক্ষিপ্ত\s*প্রশ্ন)/i);
  const cqIndex = rawText.search(/(?:সৃজনশীল\s*প্রশ্ন)/i);

  if (shortIndex !== -1 && cqIndex !== -1) {
    if (shortIndex < cqIndex) {
      mcqPart = rawText.slice(0, shortIndex);
      shortPart = rawText.slice(shortIndex, cqIndex);
      cqPart = rawText.slice(cqIndex);
    } else {
      mcqPart = rawText.slice(0, cqIndex);
      cqPart = rawText.slice(cqIndex, shortIndex);
      shortPart = rawText.slice(shortIndex);
    }
  } else if (shortIndex !== -1) {
    mcqPart = rawText.slice(0, shortIndex);
    shortPart = rawText.slice(shortIndex);
  } else if (cqIndex !== -1) {
    mcqPart = rawText.slice(0, cqIndex);
    cqPart = rawText.slice(cqIndex);
  } else {
    mcqPart = rawText;
  }

  // ১. বহুনির্বাচনি (MCQ) পার্সিং
  if (mcqPart) {
    const blocks = mcqPart.split(/(?=(?:^|\n)\s*[০-৯\d]{1,3}\s*[।\.\)]\s*)/u).filter(Boolean);
    blocks.forEach((block, idx) => {
      const trimmed = block.trim();
      const kMatch = trimmed.search(/[\(\[]?[কaA][\.\)\]]/u);
      const khMatch = trimmed.search(/[\(\[]?[খbB][\.\)\]]/u);
      const gMatch = trimmed.search(/[\(\[]?[গcC][\.\)\]]/u);
      const ghMatch = trimmed.search(/[\(\[]?[ঘdD][\.\)\]]/u);

      if (kMatch !== -1 && khMatch !== -1 && gMatch !== -1 && ghMatch !== -1) {
        const qText = clean(trimmed.slice(0, kMatch)).replace(/^[০-৯\d]{1,3}\s*[।\.\)]\s*/, "");
        const optK = clean(trimmed.slice(kMatch, khMatch)).replace(/^[\(\[]?[কaA][\.\)\]]\s*/u, "");
        const optKh = clean(trimmed.slice(khMatch, gMatch)).replace(/^[\(\[]?[খbB][\.\)\]]\s*/u, "");
        const optG = clean(trimmed.slice(gMatch, ghMatch)).replace(/^[\(\[]?[গcC][\.\)\]]\s*/u, "");
        const optGh = clean(trimmed.slice(ghMatch)).replace(/^[\(\[]?[ঘdD][\.\)\]]\s*/u, "");

        if (qText && optK && optKh) {
          mcqs.push({
            id: `mcq-${idx + 1}`,
            text: qText,
            options: { ক: optK, খ: optKh, গ: optG, ঘ: optGh },
            correct: "ক",
            sourceType: "MCQ",
          });
        }
      }
    });
  }

  // ২. সংক্ষিপ্ত প্রশ্ন পার্সিং (মান ২)
  if (shortPart) {
    const blocks = shortPart.split(/(?=(?:^|\n)\s*[০-৯\d]{1,3}\s*[।\.\)]\s*)/u).filter(Boolean);
    blocks.forEach((block, idx) => {
      const trimmed = clean(block);
      if (trimmed.includes("সংক্ষিপ্ত উত্তর প্রশ্ন") || trimmed.length < 5) return;
      const qText = trimmed.replace(/^[০-৯\d]{1,3}\s*[।\.\)]\s*/, "");
      shorts.push({
        id: `short-${idx + 1}`,
        text: qText,
        options: {},
        correct: "",
        sourceType: "SHORT",
      });
    });
  }

  // ৩. সৃজনশীল প্রশ্ন পার্সিং (CQ)
  if (cqPart) {
    const blocks = cqPart.split(/(?=(?:^|\n)\s*[০-৯\d]{1,3}\s*[।\.\)]\s*)/u).filter(Boolean);
    blocks.forEach((block, idx) => {
      const trimmed = block.trim();
      if (trimmed.includes("সৃজনশীল প্রশ্ন") || trimmed.length < 15) return;

      const k = trimmed.search(/\(ক\)/);
      const kh = trimmed.search(/\(খ\)/);
      const g = trimmed.search(/\(গ\)/);
      const gh = trimmed.search(/\(ঘ\)/);

      if (k !== -1 && kh !== -1 && g !== -1 && gh !== -1) {
        const stimulus = clean(trimmed.slice(0, k)).replace(/^[০-৯\d]{1,3}\s*[।\.\)]\s*/, "");
        const subK = clean(trimmed.slice(k, kh)).replace(/^\(ক\)\s*/, "");
        const subKh = clean(trimmed.slice(kh, g)).replace(/^\(খ\)\s*/, "");
        const subG = clean(trimmed.slice(g, gh)).replace(/^\(গ\)\s*/, "");
        const subGh = clean(trimmed.slice(gh)).replace(/^\(ঘ\)\s*/, "");

        const fullText = `${stimulus}\n\n(ক) ${subK}\n(খ) ${subKh}\n(গ) ${subG}\n(ঘ) ${subGh}`;

        cqs.push({
          id: `cq-${idx + 1}`,
          text: fullText,
          options: { ক: subK, খ: subKh, গ: subG, ঘ: subGh },
          correct: "",
          sourceType: "CQ",
        });
      }
    });
  }

  return { mcqs, shorts, cqs };
}

export default function QbExtract() {
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // আপনার মূল ফিল্টার ও কারিকুলাম স্টেট
  const [category, setCategory] = useState("SSC");
  const [subjSel, setSubjSel] = useState("");
  const [subjOther, setSubjOther] = useState("");
  const [topSel, setTopSel] = useState("");
  const [topOther, setTopOther] = useState("");
  const [source, setSource] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [lang, setLang] = useState("Bangla");
  const [approved, setApproved] = useState(false);

  // ইনপুট মোড: ফাইল বনাম টেক্সট পেস্ট
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [pastedText, setPastedText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // পার্স করা ফলাফল ও ৩টি ট্যাব
  const [activeTab, setActiveTab] = useState<"mcq" | "short" | "cq">("mcq");
  const [mcqList, setMcqList] = useState<any[]>([]);
  const [shortList, setShortList] = useState<any[]>([]);
  const [cqList, setCqList] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const subjects = useMemo(() => getCurriculumSubjects(category), [category]);
  const subjIsOther = subjSel === OTHER || subjects.length === 0;
  const subject = subjIsOther ? subjOther.trim() : subjSel;

  const chapters = useMemo(() => getCurriculumChapters(category, subjSel), [category, subjSel]);
  const topIsOther = topSel === OTHER || (subject !== "" && chapters.length === 0);
  const topic = topIsOther ? topOther.trim() : topSel;

  // ১. প্রশ্ন বের করার মূল হ্যান্ডলার (Pure Code)
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    if (!subject) {
      setMsg({ ok: false, text: "দয়া করে বিষয় সিলেক্ট বা লিখুন।" });
      return;
    }
    if (inputMode === "file" && !selectedFile) {
      setMsg({ ok: false, text: "একটি PDF ফাইল নির্বাচন করুন।" });
      return;
    }
    if (inputMode === "text" && !pastedText.trim()) {
      setMsg({ ok: false, text: "টেক্সট পেস্ট করুন।" });
      return;
    }

    setBusy(true);

    try {
      let rawText = "";

      if (inputMode === "file" && selectedFile) {
        if (selectedFile.type === "application/pdf" || selectedFile.name.endsWith(".pdf")) {
          // ব্রাউজারেই ২-কলাম সচেতন PDF পার্সিং
          rawText = await loadAndExtractPdf(selectedFile);
        } else {
          setMsg({ ok: false, text: "দয়া করে .pdf ফাইল নির্বাচন করুন।" });
          setBusy(false);
          return;
        }
      } else {
        rawText = pastedText;
      }

      const { mcqs, shorts, cqs } = parseQuestionsAlgorithm(rawText);

      setMcqList(mcqs);
      setShortList(shorts);
      setCqList(cqs);

      const allIds = [...mcqs.map((m) => m.id), ...shorts.map((s) => s.id), ...cqs.map((c) => c.id)];
      setSelectedIds(allIds);

      const total = allIds.length;
      if (total === 0) {
        setMsg({ ok: false, text: "পিডিএফ থেকে কোনো প্রশ্ন আলাদা করা যায়নি। টেক্সট পেস্ট মোড দিয়ে চেষ্টা করতে পারেন।" });
      } else {
        setMsg({
          ok: true,
          text: `🎉 সফলভাবে ${mcqs.length}টি MCQ, ${shorts.length}টি সংক্ষিপ্ত এবং ${cqs.length}টি সৃজনশীল প্রশ্ন পাওয়া গেছে! নিচে রিভিউ করে সেভ করুন।`,
        });
      }
    } catch (err: any) {
      setMsg({ ok: false, text: "এক্সট্র্যাক্ট ত্রুটি: " + err.message });
    } finally {
      setBusy(false);
    }
  }

  // ২. টিকচিহ্ন টগল
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // ৩. ডাটাবেজে বাল্ক সেভ হ্যান্ডলার
  const handleBulkSave = async () => {
    const listToSave: any[] = [];

    mcqList.forEach((m) => {
      if (selectedIds.includes(m.id)) listToSave.push(m);
    });
    shortList.forEach((s) => {
      if (selectedIds.includes(s.id)) listToSave.push(s);
    });
    cqList.forEach((c) => {
      if (selectedIds.includes(c.id)) listToSave.push(c);
    });

    if (listToSave.length === 0) {
      alert("কোনো প্রশ্ন নির্বাচন করা হয়নি!");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/qb/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          subject,
          topic: `${topic}${source ? ` [${source}]` : ""}`,
          difficulty,
          lang,
          source: source || "PDF_EXTRACT",
          approved,
          questions: listToSave,
        }),
      });

      const d = await res.json().catch(() => null);

      if (d?.ok) {
        alert(`🎉 সফলভাবে ${d.count}টি প্রশ্ন ডাটাবেজে জমা হয়েছে${d.approved ? "" : " (অনুমোদনের অপেক্ষায়)"}!`);
        setMcqList([]);
        setShortList([]);
        setCqList([]);
        setSelectedIds([]);
        setPastedText("");
        setSelectedFile(null);
      } else {
        alert("সংরক্ষণ ব্যর্থ: " + (d?.error || "অজানা ত্রুটি"));
      }
    } catch (err: any) {
      alert("নেটওয়ার্ক সমস্যা: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const totalCount = mcqList.length + shortList.length + cqList.length;

  return (
    <div className="space-y-4">
      {/* 📋 আপনার আগের ফর্মটি হুবহু অক্ষুণ্ণ রাখা হলো */}
      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div className="grid grid-cols-2 gap-2">
          {/* Category */}
          <select
            name="category"
            className={input}
            required
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubjSel("");
              setSubjOther("");
              setTopSel("");
              setTopOther("");
            }}
          >
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {c === "SSC" ? "SSC (নবম-দশম)" : c === "HSC" ? "HSC (একাদশ-দ্বাদশ)" : /^\d+$/.test(c) ? `ক্লাস ${c}` : c}
              </option>
            ))}
          </select>

          {/* Subject */}
          {subjects.length > 0 ? (
            <select
              className={input}
              value={subjSel}
              onChange={(e) => {
                setSubjSel(e.target.value);
                setSubjOther("");
                setTopSel("");
                setTopOther("");
              }}
            >
              <option value="">বিষয় বাছুন</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value={OTHER}>অন্য (নিজে লিখুন)</option>
            </select>
          ) : (
            <input
              name="subject"
              placeholder="বিষয় (যেমন: রসায়ন)"
              className={input}
              required
              value={subjOther}
              onChange={(e) => setSubjOther(e.target.value)}
            />
          )}

          {subjIsOther && subjects.length > 0 && (
            <input
              className={input + " col-span-2"}
              placeholder="বিষয়ের নাম লিখুন"
              value={subjOther}
              onChange={(e) => setSubjOther(e.target.value)}
            />
          )}

          {/* Chapter / Topic */}
          {chapters.length > 0 ? (
            <select
              className={input}
              value={topSel}
              onChange={(e) => {
                setTopSel(e.target.value);
                setTopOther("");
              }}
            >
              <option value="">অধ্যায় বাছুন</option>
              {chapters.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value={OTHER}>অন্য (নিজে লিখুন)</option>
            </select>
          ) : (
            <input
              name="topic"
              placeholder="অধ্যায় (যেমন: অধ্যায় ১ - রসায়নের ধারণা)"
              className={input}
              value={topOther}
              onChange={(e) => setTopOther(e.target.value)}
            />
          )}

          {topIsOther && chapters.length > 0 && (
            <input
              className={input}
              placeholder="অধ্যায়ের নাম লিখুন"
              value={topOther}
              onChange={(e) => setTopOther(e.target.value)}
            />
          )}

          <input 
            name="source" 
            placeholder="বোর্ড-সাল (যেমন: ঢাকা বোর্ড ২০২৫)" 
            className={input} 
            value={source} 
            onChange={(e) => setSource(e.target.value)} 
          />

          <select name="difficulty" className={input} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>

          <select name="lang" className={input} value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="Bangla">Bangla</option>
            <option value="English">English</option>
          </select>
        </div>

        {/* ইনপুট মোড সুইচ */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setInputMode("file")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${inputMode === "file" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              PDF ফাইল আপলোড
            </button>
            <button
              type="button"
              onClick={() => setInputMode("text")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${inputMode === "text" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              টেক্সট পেস্ট করুন
            </button>
          </div>

          {inputMode === "file" ? (
            <div>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className={input}
              />
              <p className="mt-1 text-xs text-slate-500">PDF ফাইল (ডিজিটাল ২-কলাম বা সাধারণ যেকোনো টেক্সট PDF চলবে)।</p>
            </div>
          ) : (
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="পিডিএফ বা ওয়ার্ড থেকে টেক্সট কপি করে এখানে সরাসরি পেস্ট করুন..."
              className={input + " font-mono text-xs"}
            />
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={approved}
            onChange={(e) => setApproved(e.target.checked)}
            className="rounded"
          /> 
          সরাসরি অনুমোদন দিন (না দিলে আগে দেখে অনুমোদন করবেন)
        </label>

        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
          <span>{busy ? "পিডিএফ থেকে প্রশ্ন পড়া হচ্ছে…" : "প্রশ্ন বের করুন"}</span>
        </button>

        {msg && (
          <p
            role="alert"
            className={`rounded-xl p-3 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
          >
            {msg.text}{" "}
            {msg.ok && (
              <Link href="/admin/questions" className="font-bold underline ml-1">
                প্রশ্ন ব্যাংক দেখুন
              </Link>
            )}
          </p>
        )}
      </form>

      {/* 🎯 ৩টি স্মার্ট ট্যাব ও বাল্ক সেভ টেবিল (MCQ, সংক্ষিপ্ত, সৃজনশীল) */}
      {totalCount > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("mcq")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === "mcq" ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200"}`}
              >
                বহুনির্বাচনি ({mcqList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("short")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === "short" ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200"}`}
              >
                সংক্ষিপ্ত প্রশ্ন ({shortList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("cq")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === "cq" ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200"}`}
              >
                সৃজনশীল ({cqList.length})
              </button>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleBulkSave}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>নির্বাচিত প্রশ্নগুলো ডাটাবেজে সেভ করুন</span>
            </button>
          </div>

          {/* ১. বহুনির্বাচনি (MCQ) ট্যাব */}
          {activeTab === "mcq" && (
            <div className="space-y-3">
              {mcqList.map((q, idx) => (
                <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:bg-slate-900">
                  <div className="flex items-start gap-2.5">
                    <button type="button" onClick={() => toggleSelect(q.id)} className="mt-0.5 text-blue-600">
                      {selectedIds.includes(q.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {idx + 1}. <MathText text={q.text} />
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                        {Object.entries(q.options || {}).map(([k, v]) => (
                          <div key={k} className="p-2 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 flex items-center gap-1.5">
                            <span className="font-bold text-slate-500">({k})</span>
                            <MathText text={String(v)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ২. সংক্ষিপ্ত প্রশ্ন ট্যাব */}
          {activeTab === "short" && (
            <div className="space-y-3">
              {shortList.map((q, idx) => (
                <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:bg-slate-900 flex items-start gap-2.5">
                  <button type="button" onClick={() => toggleSelect(q.id)} className="mt-0.5 text-blue-600">
                    {selectedIds.includes(q.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {idx + 1}. <MathText text={q.text} />
                    </p>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-500 mt-1 inline-block">
                      মান: ২
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ৩. সৃজনশীল প্রশ্ন (CQ) ট্যাব */}
          {activeTab === "cq" && (
            <div className="space-y-4">
              {cqList.map((q, idx) => (
                <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:bg-slate-900 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <button type="button" onClick={() => toggleSelect(q.id)} className="mt-0.5 text-blue-600">
                      {selectedIds.includes(q.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        সৃজনশীল প্রশ্ন {idx + 1}
                      </span>
                      <div className="mt-1 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700 whitespace-pre-line">
                        <MathText text={q.text} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
