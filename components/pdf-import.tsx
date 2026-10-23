"use client";

import React, { useMemo, useState } from "react";
import {
  FileUp, Loader2, CheckCircle2, AlertTriangle,
  Trash2, CheckSquare, Square, ChevronDown, ChevronUp, Save, HelpCircle,
} from "lucide-react";
import type { OptionKey, ParsedMcq } from "@/lib/pdf-mcq/parse";
import { saveExtracted } from "@/app/admin/questions/actions";
import { NCTB_CLASSES, type NctbClass } from "@/lib/nctb-data";

interface PdfImportProps {
  categories: string[];
}

const BN_LABEL: Record<OptionKey, string> = { A: "ক", B: "খ", C: "গ", D: "ঘ" };
const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D"];

// শ্রেণি (প্রদর্শন) থেকে nctb-data-এর ক্লাসের নাম
const CLASS_MAP: Record<string, string> = {
  "1": "Class 1", "2": "Class 2", "3": "Class 3", "4": "Class 4", "5": "Class 5",
  "6": "Class 6", "7": "Class 7", "8": "Class 8",
  SSC: "Class 9-10",
  HSC: "Class 11-12",
};

const OTHER = "__other__";

function subjectsFor(cat: string) {
  const key = CLASS_MAP[cat];
  const cls = (NCTB_CLASSES as NctbClass[]).find((c) => c.class === key);
  return cls ? cls.subjects : [];
}

export default function PdfImport({ categories }: PdfImportProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [category, setCategory] = useState(categories[0] ?? "SSC");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [lang, setLang] = useState("Bangla");
  const [source, setSource] = useState("PDF_IMPORT");
  const [approved, setApproved] = useState(false);

  const [questions, setQuestions] = useState<ParsedMcq[]>([]);
  const [selectedNums, setSelectedNums] = useState<number[]>([]);

  const subjectList = useMemo(() => subjectsFor(category), [category]);
  const chapterList = useMemo(
    () => subjectList.find((s) => s.name === subject)?.chapters ?? [],
    [subjectList, subject]
  );

  const finalSubject = subject === OTHER ? customSubject.trim() : subject.trim();
  const finalTopic = topic === OTHER ? customTopic.trim() : topic.trim();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("দয়া করে একটি PDF ফাইল নির্বাচন করুন।");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);

    const fd = new FormData();
    fd.set("file", file);

    try {
      const res = await fetch("/api/admin/pdf-import", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) {
        const list: ParsedMcq[] = data.questions ?? [];
        setQuestions(list);
        setSelectedNums(list.map((q) => q.number));
        if (list.length === 0) setNotice("কোনো প্রশ্ন পাওয়া যায়নি।");
      } else {
        setError(data.error || "পিডিএফ পড়তে ব্যর্থ হয়েছে।");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "নেটওয়ার্ক ত্রুটি।");
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
    if (!finalSubject) {
      setError("দয়া করে বিষয় নির্বাচন করুন।");
      return;
    }
    const itemsToSave = questions.filter((q) => selectedNums.includes(q.number));
    if (itemsToSave.length === 0) {
      setError("কোনো প্রশ্ন নির্বাচন করা হয়নি।");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const result = await saveExtracted(
        {
          subject: finalSubject,
          category,
          topic: finalTopic || "সাধারণ",
          difficulty,
          lang,
          source: source.trim() || "PDF_IMPORT",
          approved,
        },
        itemsToSave.map((q) => ({
          text: q.text,
          options: q.options,
          correct: q.correct,
          explanation: "",
        }))
      );

      if (result.ok) {
        setNotice(`🎉 ${result.count}টি প্রশ্ন ডাটাবেজে সংরক্ষিত হয়েছে।`);
        setQuestions([]);
        setSelectedNums([]);
        setFile(null);
      } else {
        setError(result.error ?? "সংরক্ষণ হয়নি।");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "সংরক্ষণে সমস্যা।");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none dark:bg-slate-950";
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
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubject("");
                  setTopic("");
                }}
                className={inputCls}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>বিষয় *</label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setTopic("");
                }}
                className={inputCls}
              >
                <option value="">বিষয় বাছুন</option>
                {subjectList.map((s) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
                <option value={OTHER}>অন্য (নিজে লিখুন)</option>
              </select>
              {subject === OTHER && (
                <input
                  type="text"
                  placeholder="বিষয়ের নাম লিখুন"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className={inputCls + " mt-2"}
                />
              )}
            </div>

            <div>
              <label className={labelCls}>অধ্যায় / টপিক</label>
              {chapterList.length > 0 ? (
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className={inputCls}
                >
                  <option value="">অধ্যায় বাছুন</option>
                  {chapterList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value={OTHER}>অন্য (নিজে লিখুন)</option>
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="যেমন: অধ্যায় ১"
                  value={topic === OTHER ? customTopic : topic}
                  onChange={(e) => {
                    setTopic(OTHER);
                    setCustomTopic(e.target.value);
                  }}
                  className={inputCls}
                />
              )}
              {chapterList.length > 0 && topic === OTHER && (
                <input
                  type="text"
                  placeholder="অধ্যায়ের নাম লিখুন"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className={inputCls + " mt-2"}
                />
              )}
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

            <div className="sm:col-span-2">
              <label className={labelCls}>PDF ফাইল নির্বাচন করুন *</label>
              <input
                type="file"
                required
                accept=".pdf,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className={inputCls + " file:mr-2 file:rounded-lg file:border-0 file:bg-blue-50 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-blue-700"}
              />
            </div>

            <div className="flex items-center sm:mt-5">
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
                <span>{busy ? "পিডিএফ থেকে প্রশ্ন পড়া হচ্ছে…" : "PDF বিশ্লেষণ করুন"}</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
              <AlertTriangle size={15} /> <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-xs font-bold text-green-700">
              {notice}
            </div>
          )}

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
                                  : "border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900"
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
  
