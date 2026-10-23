"use client";

import React, { useState } from "react";
import { 
  FileUp, Loader2, CheckCircle2, AlertTriangle, 
  Trash2, CheckSquare, Square, ChevronDown, ChevronUp, Save, HelpCircle 
} from "lucide-react";
import { OptionKey, ParsedMcq } from "@/lib/pdf-mcq/parse";
import { saveExtracted } from "@/app/admin/questions/actions";

interface PdfImportProps {
  categories: string[];
}

const BN_LABEL: Record<OptionKey, string> = {
  A: "ক",
  B: "খ",
  C: "গ",
  D: "ঘ",
};

export default function PdfImport({ categories }: PdfImportProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // মেটাডাটা স্টেট
  const [category, setCategory] = useState("SSC");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [lang, setLang] = useState("Bangla");
  const [source, setSource] = useState("PDF_IMPORT");
  const [approved, setApproved] = useState(false);

  // এক্সট্র্যাক্ট করা ফলাফল
  const [questions, setQuestions] = useState<ParsedMcq[]>([]);
  const [selectedNums, setSelectedNums] = useState<number[]>([]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("দয়া করে একটি PDF ফাইল নির্বাচন করুন।");
      return;
    }

    setBusy(true);
    setError(null);

    const fd = new FormData();
    fd.set("file", file);

    try {
      const res = await fetch("/api/admin/pdf-import", {
        method: "POST",
        body: fd,
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

  const toggleSelect = (num: number) => {
    setSelectedNums((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const selectAll = () => {
    if (selectedNums.length === questions.length) {
      setSelectedNums([]);
    } else {
      setSelectedNums(questions.map((q) => q.number));
    }
  };

  const updateQuestionText = (num: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.number === num ? { ...q, text: val } : q))
    );
  };

  const updateOptionText = (num: number, key: OptionKey, val: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.number === num
          ? { ...q, options: { ...q.options, [key]: val } }
          : q
      )
    );
  };

  const setCorrectOption = (num: number, key: OptionKey) => {
    setQuestions((prev) =>
      prev.map((q) => (q.number === num ? { ...q, correct: key } : q))
    );
  };

  const clearCorrectOption = (num: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.number === num ? { ...q, correct: "" } : q))
    );
  };

  const removeQuestion = (num: number) => {
    setQuestions((prev) => prev.filter((q) => q.number !== num));
    setSelectedNums((prev) => prev.filter((n) => n !== num));
  };

  const handleBulkSave = async () => {
    if (!subject.trim()) {
      alert("দয়া করে বিষয়ের নাম লিখুন।");
      return;
    }

    const itemsToSave = questions.filter((q) => selectedNums.includes(q.number));
    if (itemsToSave.length === 0) {
      alert("কোনো প্রশ্ন নির্বাচন করা হয়নি।");
      return;
    }

    setSaving(true);

    const formData = new FormData();
    formData.set("category", category);
    formData.set("subject", subject.trim());
    formData.set("topic", topic.trim() || "সাধারণ");
    formData.set("difficulty", difficulty);
    formData.set("lang", lang);
    formData.set("source", source.trim() || "PDF_IMPORT");
    formData.set("approved", approved ? "true" : "false");
    formData.set("items", JSON.stringify(itemsToSave));

    await saveExtracted(formData);
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-6">
      <div 
        onClick={() => setOpen(!open)} 
        className="flex cursor-pointer items-center justify-between text-base font-bold text-slate-900 dark:text-slate-100 select-none"
      >
        <span className="flex items-center gap-2">
          <FileUp size={20} className="text-blue-600" />
          PDF থেকে প্রশ্ন আমদানি করুন (MCQ Parser)
        </span>
        <button type="button" className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          {/* আপলোড ও ফিল্টার ফর্ম */}
          <form onSubmit={handleUpload} className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">শ্রেণি / ক্যাটাগরি</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-950 px-3 py-2 text-xs outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">বিষয় *</label>
              <input
                type="text"
                required
                placeholder="যেমন: রসায়ন বা পদার্থবিজ্ঞান"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-950 px-3 py-2 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">অধ্যায় / টপিক</label>
              <input
                type="text"
                placeholder="যেমন: অধ্যায় ১ - রসায়নের ধারণা"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-950 px-3 py-2 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">কঠিনতা</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-950 px-3 py-2 text-xs outline-none"
              >
                <option value="EASY">সহজ (EASY)</option>
                <option value="MEDIUM">মাঝারি (MEDIUM)</option>
                <option value="HARD">কঠিন (HARD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ভাষা</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-950 px-3 py-2 text-xs outline-none"
              >
                <option value="Bangla">বাংলা</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">উৎস / বোর্ড</label>
              <input
                type="text"
                placeholder="যেমন: বোর্ড বই বা ঢাকা বোর্ড ২০২৪"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-950 px-3 py-2 text-xs outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">PDF ফাইল নির্বাচন করুন *</label>
              <input
                type="file"
                required
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs outline-none file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
              />
            </div>

            <div className="flex items-center sm:mt-5">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
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
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition disabled:opacity-50"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
                <span>{busy ? "পিডিএফ থেকে প্রশ্ন পড়া হচ্ছে…" : "PDF বিশ্লেষণ করুন"}</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200 flex items-center gap-2">
              <AlertTriangle size={15} /> <span>{error}</span>
            </div>
          )}

          {/* 🎯 এক্সট্র্যাক্ট করা প্রশ্নসমূহের রিভিউ প্যানেল */}
          {questions.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
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
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>নির্বাচিত {selectedNums.length}টি প্রশ্ন সংরক্ষণ করুন</span>
                </button>
              </div>

              {/* প্রশ্ন তালিকা */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {questions.map((q) => {
                  const isChecked = selectedNums.includes(q.number);
                  return (
                    <div
                      key={q.number}
                      className={`rounded-2xl border p-4 transition ${
                        isChecked 
                          ? "border-blue-300 bg-white dark:bg-slate-900 shadow-xs" 
                          : "border-slate-200 bg-slate-50/50 opacity-60 dark:bg-slate-950"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleSelect(q.number)}
                            className="mt-1 text-blue-600"
                          >
                            {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                          </button>

                          <div className="flex-1">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 mr-1.5">
                              প্রশ্ন {q.number}.
                            </span>
                            <input
                              type="text"
                              value={q.text}
                              onChange={(e) => updateQuestionText(q.number, e.target.value)}
                              className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 text-xs font-semibold outline-none focus:border-blue-600"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeQuestion(q.number)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="তালিকা থেকে বাদ দিন"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* অপশনসমূহ ও উত্তর নির্বাচন */}
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 pl-6">
                        {(["A", "B", "C", "D"] as OptionKey[]).map((key) => {
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
                                onClick={() => isCorrect ? clearCorrectOption(q.number) : setCorrectOption(q.number, key)}
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                                  isCorrect
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "bg-white border border-slate-300 text-slate-700 hover:border-slate-400"
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
                                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none"
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* ওয়ার্নিং ও স্ট্যাটাস ব্যাজ */}
                      <div className="mt-3 pl-6 flex flex-wrap items-center gap-1.5">
                        {!q.correct ? (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                            <HelpCircle size={11} /> উত্তর চিহ্নিত করা নেই (খালি সেভ হবে)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 size={11} /> সঠিক উত্তর: {BN_LABEL[q.correct]}
                          </span>
                        )}

                        {q.flags.map((flag, fi) => (
                          <span
                            key={fi}
                            className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
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
