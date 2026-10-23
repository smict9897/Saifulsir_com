"use client";

import React, { useState } from "react";
import { 
  FileUp, Loader2, CheckCircle2, AlertTriangle, 
  Trash2, CheckSquare, Square, ChevronDown, ChevronUp, Save, HelpCircle 
} from "lucide-react";
import type { OptionKey, ParsedMcq } from "@/lib/pdf-mcq/parse";
import { saveExtracted } from "@/app/admin/questions/actions";

interface PdfImportProps {
  categories: string[];
}

const BN_LABEL: Record<OptionKey, string> = { A: "ক", B: "খ", C: "গ", D: "ঘ" };
const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D"];

// 🎯 ব্রাউজার-সাইড ২-কলাম এক্সট্রাক্টর (সার্ভারে কোনো worker.js এরর হবে না)
async function extractTextFromPdfInBrowser(file: File): Promise<string> {
  if (typeof window === "undefined") return "";

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
  let fullDocumentText = "";

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();
    const midX = viewport.width / 2;

    const col1Items: any[] = [];
    const col2Items: any[] = [];

    textContent.items.forEach((item: any) => {
      const x = item.transform[4];
      if (x < midX - 5) {
        col1Items.push(item);
      } else {
        col2Items.push(item);
      }
    });

    const buildColumn = (items: any[]) => {
      if (!items.length) return "";
      items.sort((a, b) => b.transform[5] - a.transform[5]);

      let res = "";
      let currentY = items[0].transform[5];
      let lastXEnd = items[0].transform[4] + items[0].width;
      res += items[0].str;

      for (let i = 1; i < items.length; i++) {
        const it = items[i];
        const y = it.transform[5];
        const x = it.transform[4];

        if (Math.abs(y - currentY) > 5) {
          res += "\n" + it.str;
          currentY = y;
          lastXEnd = x + it.width;
        } else {
          const gap = x - lastXEnd;
          if (gap > 4) res += " " + it.str;
          else res += it.str;
          lastXEnd = Math.max(lastXEnd, x + it.width);
        }
      }
      return res;
    };

    fullDocumentText += `\n${buildColumn(col1Items)}\n\n${buildColumn(col2Items)}\n`;
  }

  return fullDocumentText;
}

export default function PdfImport({ categories }: PdfImportProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "text">("file");

  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // মেটাডাটা
  const [category, setCategory] = useState(categories[0] ?? "SSC");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [lang, setLang] = useState("Bangla");
  const [source, setSource] = useState("বোর্ড বই");
  const [approved, setApproved] = useState(false);

  const [questions, setQuestions] = useState<ParsedMcq[]>([]);
  const [selectedNums, setSelectedNums] = useState<number[]>([]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === "file" && !file) {
      setError("দয়া করে একটি PDF ফাইল নির্বাচন করুন।");
      return;
    }
    if (inputMode === "text" && !pastedText.trim()) {
      setError("দয়া করে টেক্সট পেস্ট করুন।");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      let textToSend = "";

      if (inputMode === "file" && file) {
        // ১. ব্রাউজারেই ২-কলাম টেক্সট এক্সট্রাকশন (০% ক্র্যাশ)
        textToSend = await extractTextFromPdfInBrowser(file);
      } else {
        textToSend = pastedText;
      }

      // ২. টেক্সট পাঠানো এপিআই-তে
      const res = await fetch("/api/admin/pdf-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend }),
      });

      const data = await res.json();
      if (data.ok) {
        setQuestions(data.questions || []);
        setSelectedNums((data.questions || []).map((q: ParsedMcq) => q.number));
      } else {
        setError(data.error || "পিডিএফ পড়তে ব্যর্থ হয়েছে।");
      }
    } catch (err: any) {
      setError(err?.message || "নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  };

  const toggleSelect = (num: number) =>
    setSelectedNums((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );

  const selectAll = () =>
    setSelectedNums(
      selectedNums.length === questions.length ? [] : questions.map((q) => q.number)
    );

  const updateQuestionText = (num: number, val: string) =>
    setQuestions((prev) => prev.map((q) => (q.number === num ? { ...q, text: val } : q)));

  const updateOptionText = (num: number, key: OptionKey, val: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.number === num ? { ...q, options: { ...q.options, [key]: val } } : q
      )
    );

  const setCorrectOption = (num: number, key: OptionKey) =>
    setQuestions((prev) => prev.map((q) => (q.number === num ? { ...q, correct: key } : q)));

  const clearCorrectOption = (num: number) =>
    setQuestions((prev) => prev.map((q) => (q.number === num ? { ...q, correct: "" } : q)));

  const removeQuestion = (num: number) => {
    setQuestions((prev) => prev.filter((q) => q.number !== num));
    setSelectedNums((prev) => prev.filter((n) => n !== num));
  };

  const handleBulkSave = async () => {
    if (!subject.trim()) {
      alert("দয়া করে বিষয়ের নাম লিখুন।");
      return;
    }

    const itemsToSave = questions.filter((q) => selectedNums.includes(q.number));
    if (itemsToSave.length === 0) {
      alert("কোনো প্রশ্ন নির্বাচন করা হয়নি।");
      return;
    }

    setSaving(true);

    const fd = new FormData();
    fd.set("category", category);
    fd.set("subject", subject.trim());
    fd.set("topic", topic.trim() || "অধ্যায় ১");
    fd.set("difficulty", difficulty);
    fd.set("lang", lang);
    fd.set("source", source.trim() || "PDF_IMPORT");
    fd.set("approved", approved ? "true" : "false");
    fd.set("items", JSON.stringify(itemsToSave));

    await saveExtracted(fd);
    setSaving(false);
  };

  const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:bg-slate-950 dark:border-slate-800";
  const labelCls = "mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300";

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div 
        onClick={() => setOpen(!open)} 
        className="flex cursor-pointer select-none items-center justify-between text-base font-bold text-slate-900 dark:text-slate-100"
      >
        <span className="flex items-center gap-2">
          <FileUp size={20} className="text-blue-600" />
          PDF থেকে প্রশ্ন আমদানি করুন (MCQ Parser)
        </span>
        <button type="button" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <form onSubmit={handleUpload} className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={labelCls}>শ্রেণি / ক্যাটাগরি</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>বিষয় *</label>
              <input
                type="text"
                required
                placeholder="যেমন: রসায়ন"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>অধ্যায় / টপিক</label>
              <input
                type="text"
                placeholder="অধ্যায় ১ - রসায়নের ধারণা"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>কঠিনতা</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")}
                className={inputCls}
              >
                <option value="EASY">সহজ (EASY)</option>
                <option value="MEDIUM">মাঝারি (MEDIUM)</option>
                <option value="HARD">কঠিন (HARD)</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>ভাষা</label>
              <select value={lang} onChange={(e) => setLang(e.target.value)} className={inputCls}>
                <option value="Bangla">বাংলা</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>উৎস / বোর্ড</label>
              <input
                type="text"
                placeholder="যেমন: বোর্ড বই"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* ইনপুট মোড */}
            <div className="sm:col-span-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setInputMode("file")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${inputMode === "file" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
                >
                  PDF ফাইল আপলোড
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("text")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${inputMode === "text" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
                >
                  সরাসরি টেক্সট পেস্ট
                </button>
              </div>

              {inputMode === "file" ? (
                <div>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className={inputCls + " file:mr-2 file:rounded-lg file:border-0 file:bg-blue-50 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-blue-700"}
                  />
                  <p className="mt-1 text-xs text-slate-500">ডিজিটাল ও ক্লিয়ার ২-কলাম টেক্সট PDF নির্বাচন করুন।</p>
                </div>
              ) : (
                <textarea
                  rows={6}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="পিডিএফ থেকে টেক্সট কপি করে এখানে পেস্ট করুন..."
                  className={inputCls + " font-mono text-xs"}
                />
              )}
            </div>

            <div className="flex items-center sm:col-span-3">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={approved}
                  onChange={(e) => setApproved(e.target.checked)}
                  className="rounded"
                />
                সরাসরি অনুমোদন দিন (Approved)
              </label>
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50 sm:text-sm"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
                <span>{busy ? "পিডিএফ থেকে প্রশ্ন পড়া হচ্ছে…" : "PDF বিশ্লেষণ করুন"}</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
              <AlertTriangle size={15} /> <span>{error}</span>
            </div>
          )}

          {/* 🎯 এক্সট্র্যাক্ট করা প্রশ্নের প্রিভিউ তালিকা */}
          {questions.length > 0 && (
            <div className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-800">
              <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    {selectedNums.length === questions.length ? (
                      <CheckSquare size={16} className="text-blue-600" />
                    ) : (
                      <Square size={16} />
                    )}
                    <span>সব নির্বাচন ({selectedNums.length}/{questions.length})</span>
                  </button>
                  <span className="text-xs text-slate-500">
                    সতর্কতা: {questions.filter((q) => q.flags.length > 0).length}টি
                  </span>
                </div>

                <button
                  type="button"
                  disabled={saving || selectedNums.length === 0}
                  onClick={handleBulkSave}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>নির্বাচিত {selectedNums.length}টি প্রশ্ন সংরক্ষণ করুন</span>
                </button>
              </div>

              <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
                {questions.map((q) => {
                  const isChecked = selectedNums.includes(q.number);
                  return (
                    <div
                      key={q.number}
                      className={`rounded-2xl border p-4 transition ${
                        isChecked
                          ? "border-blue-300 bg-white shadow-xs dark:bg-slate-900"
                          : "border-slate-200 bg-slate-50/50 opacity-60 dark:bg-slate-950"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-1 items-start gap-2">
                          <button type="button" onClick={() => toggleSelect(q.number)} className="mt-1 text-blue-600">
                            {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                          </button>
                          <div className="flex-1">
                            <span className="mr-1.5 text-xs font-bold text-blue-700 dark:text-blue-400">
                              প্রশ্ন {q.number}.
                            </span>
                            <input
                              type="text"
                              value={q.text}
                              onChange={(e) => updateQuestionText(q.number, e.target.value)}
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(q.number)}
                          className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
                          title="তালিকা থেকে বাদ দিন"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-3 grid gap-2 pl-6 sm:grid-cols-2">
                        {OPTION_KEYS.map((key) => {
                          const isCorrect = q.correct === key;
                          return (
                            <div
                              key={key}
                              className={`flex items-center gap-2 rounded-xl border p-1.5 transition ${
                                isCorrect
                                  ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30"
                                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  isCorrect ? clearCorrectOption(q.number) : setCorrectOption(q.number, key)
                                }
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                                  isCorrect
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                                }`}
                                title="সঠিক উত্তর হিসেবে চিহ্নিত করুন"
                              >
                                {BN_LABEL[key]}
                              </button>
                              <input
                                type="text"
                                value={q.options[key] || ""}
                                onChange={(e) => updateOptionText(q.number, key, e.target.value)}
                                placeholder={`অপশন (${BN_LABEL[key]})`}
                                className="w-full bg-transparent text-xs text-slate-800 outline-none dark:text-slate-200"
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-6">
                        {!q.correct ? (
                          <span className="flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            <HelpCircle size={11} /> উত্তর চিহ্নিত করা নেই (খালি সেভ হবে)
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            <CheckCircle2 size={11} /> সঠিক উত্তর: {BN_LABEL[q.correct as OptionKey]}
                          </span>
                        )}
                        {q.flags.map((flag, fi) => (
                          <span
                            key={fi}
                            className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700"
                          >
                            ⚠️ {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
