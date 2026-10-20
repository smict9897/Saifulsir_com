"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Database, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import LiveExamPlayer, { ExamQuestion } from "@/components/LiveExamPlayer";
import rawCurriculum from "@/nctb-curriculum.json";

const classLabelMap: Record<string, string> = {
  "Class 6": "৬ষ্ঠ শ্রেণি (Class 6)",
  "Class 7": "৭ম শ্রেণি (Class 7)",
  "Class 8": "৮ম শ্রেণি (Class 8)",
  "Class 9-10": "এসএসসি (Class 9-10)",
  "Class 11-12": "এইচএসসি (Class 11-12)",
};

export default function ExamPage() {
  // মোড নির্বাচন: "DB" (ডাটাবেজ) অথবা "AI" (জেমিনি)
  const [examMode, setExamMode] = useState<"DB" | "AI">("DB");

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [customChapter, setCustomChapter] = useState("");
  const [difficulty, setDifficulty] = useState("মাঝারি");
  const [count, setCount] = useState("20");
  const [language, setLanguage] = useState("বাংলা");

  const [loading, setLoading] = useState(false);
  const [examReady, setExamReady] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const availableSubjects = useMemo(() => {
    if (!selectedClass) return [];
    const foundClass = rawCurriculum.classes.find((c) => c.class === selectedClass);
    return foundClass ? foundClass.subjects : [];
  }, [selectedClass]);

  const availableChapters = useMemo(() => {
    if (!selectedSubject) return [];
    const foundSubject = availableSubjects.find((s) => s.name === selectedSubject);
    return foundSubject && foundSubject.chapters ? foundSubject.chapters : [];
  }, [selectedSubject, availableSubjects]);

  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject) {
      setErrorMsg("দয়া করে ক্লাস এবং বিষয় নির্বাচন করুন।");
      return;
    }

    const finalChapter = selectedChapter === "custom" 
      ? customChapter 
      : (selectedChapter || "সম্পূর্ণ বই / সিলেবাস");

    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: examMode, // "DB" অথবা "AI"
          className: selectedClass,
          subject: selectedSubject,
          chapter: finalChapter,
          difficulty,
          count: parseInt(count),
          language,
        }),
      });

      const data = await res.json();
      
      if (data.success && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setExamReady(true);
      } else {
        setErrorMsg(data.error || "প্রশ্ন আনতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "সার্ভারে সমস্যা হয়েছে। ইন্টারনেট কানেকশন চেক করুন।");
    } finally {
      setLoading(false);
    }
  };

  if (examReady && questions.length > 0) {
    const finalChapterText = selectedChapter === "custom" ? customChapter : selectedChapter;
    return (
      <LiveExamPlayer
        examTitle={`${selectedClass} • ${selectedSubject} ${finalChapterText ? `(${finalChapterText})` : ""}`}
        questions={questions}
        timeInMinutes={parseInt(count)}
        negativeMark={0.5}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-6 px-4 sm:px-6">
      <div className="mx-auto max-w-xl">
        
        {/* মোড সিলেকশন ট্যাব (ডাটাবেজ বনাম AI) */}
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-200/80 p-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => { setExamMode("DB"); setErrorMsg(""); }}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all ${
              examMode === "DB"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Database size={16} />
            <span>ডাটাবেজ থেকে পরীক্ষা</span>
          </button>

          <button
            type="button"
            onClick={() => { setExamMode("AI"); setErrorMsg(""); }}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all ${
              examMode === "AI"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles size={16} />
            <span>AI দিয়ে নতুন প্রশ্ন</span>
          </button>
        </div>

        {/* ফর্ম কার্ড */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              {examMode === "DB" ? "ডাটাবেজ প্রশ্নব্যাংক" : "এক ক্লিকে প্রশ্ন তৈরি"}
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-600 border border-blue-100">
                {examMode === "DB" ? "Fast & Live" : "AI Mode"}
              </span>
            </h1>
          </div>

          {errorMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-200">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleStartExam} className="space-y-4">
            {/* ক্লাস সিলেক্ট */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ক্লাস</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSubject("");
                  setSelectedChapter("");
                  setCustomChapter("");
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 shadow-xs"
              >
                <option value="">ক্লাস বাছুন</option>
                {rawCurriculum.classes.map((c) => (
                  <option key={c.class} value={c.class}>
                    {classLabelMap[c.class] || c.class}
                  </option>
                ))}
              </select>
            </div>

            {/* বিষয় সিলেক্ট */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">বিষয়</label>
              <select
                disabled={!selectedClass}
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedChapter("");
                  setCustomChapter("");
                }}
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none shadow-xs transition ${
                  !selectedClass 
                    ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" 
                    : "bg-white text-slate-800 border-slate-200 focus:border-blue-500"
                }`}
              >
                <option value="">
                  {selectedClass ? "বিষয় নির্বাচন করুন" : "আগে ক্লাস বাছুন"}
                </option>
                {availableSubjects.map((sub) => (
                  <option key={sub.name} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* অধ্যায় সিলেক্ট */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">অধ্যায়</label>
              {availableChapters.length > 0 ? (
                <select
                  disabled={!selectedSubject}
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none shadow-xs transition ${
                    !selectedSubject 
                      ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" 
                      : "bg-white text-slate-800 border-slate-200 focus:border-blue-500"
                  }`}
                >
                  <option value="">সম্পূর্ণ বই / সকল অধ্যায়</option>
                  {availableChapters.map((chap) => (
                    <option key={chap} value={chap}>
                      {chap}
                    </option>
                  ))}
                  <option value="custom">✏️ নিজের মতো টপিক লিখুন...</option>
                </select>
              ) : (
                <input
                  type="text"
                  placeholder={selectedSubject ? "অধ্যায় বা টপিকের নাম লিখুন (ঐচ্ছিক)" : "আগে বিষয় দিন"}
                  disabled={!selectedSubject}
                  value={customChapter}
                  onChange={(e) => setCustomChapter(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              )}

              {selectedChapter === "custom" && (
                <input
                  type="text"
                  placeholder="নির্দিষ্ট কোনো টপিক বা অধ্যায়ের নাম লিখুন..."
                  value={customChapter}
                  onChange={(e) => setCustomChapter(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-blue-300 bg-blue-50/30 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
                  autoFocus
                />
              )}
            </div>

            {/* প্রশ্ন সংখ্যা ও কঠিনতা */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">প্রশ্ন সংখ্যা</label>
                <select
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 shadow-xs"
                >
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                  <option value="25">25</option>
                  <option value="30">30</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">কঠিনতা</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 shadow-xs"
                >
                  <option value="সহজ">সহজ</option>
                  <option value="মাঝারি">মাঝারি</option>
                  <option value="কঠিন">কঠিন</option>
                </select>
              </div>
            </div>

            {/* বাটন */}
            <button
              type="submit"
              disabled={loading}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white shadow-md transition disabled:opacity-70 ${
                examMode === "DB"
                  ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{examMode === "DB" ? "ডাটাবেজ থেকে প্রশ্ন আনা হচ্ছে..." : "AI দিয়ে প্রশ্ন তৈরি হচ্ছে..."}</span>
                </>
              ) : (
                <>
                  {examMode === "DB" ? <Database size={18} /> : <Sparkles size={18} />}
                  <span>{examMode === "DB" ? "পরীক্ষা শুরু করুন (ডাটাবেজ)" : "প্রশ্ন তৈরি ও পরীক্ষা শুরু (AI)"}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
