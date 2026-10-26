"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Zap, ArrowRight, Loader2, AlertCircle, CheckSquare } from "lucide-react";
import LiveExamPlayer, { ExamQuestion } from "@/components/LiveExamPlayer";
import rawCurriculum from "@/nctb-curriculum.json";
import { useSession } from "next-auth/react"; // 🎯 সেশন চেক করার জন্য

const classLabelMap: Record<string, string> = {
  "Class 6": "৬ষ্ঠ শ্রেণি (Class 6)",
  "Class 7": "৭ম শ্রেণি (Class 7)",
  "Class 8": "৮ম শ্রেণি (Class 8)",
  "Class 9-10": "SSC (নবম-দশম)",
  "Class 11-12": "HSC (একাদশ-দ্বাদশ)",
};

export default function ExamPage() {
  const { data: session } = useSession(); // 🎯 ইউজারের রোল পাওয়ার জন্য
  const isAdmin = session?.user?.role === "ADMIN"; // 🎯 অ্যাডমিন কি না চেক

  const [selectedClass, setSelectedClass] = useState("Class 9-10");
  const [selectedSubject, setSelectedSubject] = useState("তথ্য ও যোগাযোগ প্রযুক্তি");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [customChapter, setCustomChapter] = useState("");
  const [difficulty, setDifficulty] = useState("মাঝারি");
  const [count, setCount] = useState("20");
  const [language, setLanguage] = useState("বাংলা");
  const [questionType, setQuestionType] = useState("MCQ"); 

  const [loading, setLoading] = useState(false);
  const [examReady, setExamReady] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const availableSubjects = useMemo(() => {
    if (!selectedClass) return [];
    const foundClass = rawCurriculum.classes.find((c: any) => c.class === selectedClass);
    return foundClass ? foundClass.subjects : [];
  }, [selectedClass]);

  const availableChapters = useMemo(() => {
    if (!selectedSubject) return [];
    const foundSubject = availableSubjects.find((s: any) => s.name === selectedSubject);
    return foundSubject && foundSubject.chapters ? foundSubject.chapters : [];
  }, [selectedSubject, availableSubjects]);

  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject) {
      setErrorMsg("দয়া করে ক্লাস এবং বিষয় নির্বাচন করুন।");
      return;
    }

    const finalChapter = selectedChapter === "custom" ? customChapter : (selectedChapter || "সম্পূর্ণ বই / সিলেবাস");
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "EXAM",
          questionType: questionType,
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
        setErrorMsg(data.error || "প্রশ্ন তৈরি করতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      setErrorMsg("সার্ভারে সমস্যা হয়েছে। ইন্টারনেট কানেকশন চেক করুন।");
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
        isAdmin={isAdmin} // 🎯 এখানে isAdmin পাস করা হলো
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 font-sans">
      <div className="mx-auto max-w-2xl space-y-4">
        {/* ... (বাকি ফর্মের ডিজাইন আগের মতোই থাকবে, আমি শুধু উপরে isAdmin যুক্ত করেছি) ... */}
        
        {/* উপরের নীল কার্ড */}
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-md cursor-pointer hover:opacity-95">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <CheckSquare size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">দেখে প্রশ্ন তৈরি করুন</h2>
              <p className="text-xs text-blue-100">প্রশ্ন ব্যাংক থেকে নিজে দেখে বাছাই করে প্রশ্নপত্র বানান</p>
            </div>
          </div>
          <ArrowRight size={20} />
        </div>

        {/* উপরের সবুজ কার্ড */}
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white shadow-md mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Zap size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">এক ক্লিকে প্রশ্ন তৈরি করুন</h2>
              <p className="text-xs text-emerald-100">ক্লাস, বিষয় ও অধ্যায় দিন, AI প্রশ্ন বানিয়ে দেবে</p>
            </div>
          </div>
          <ArrowRight size={20} />
        </div>

        {/* ফর্ম */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-6">এক ক্লিকে প্রশ্ন তৈরি করুন (AI)</h1>

          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600 border border-red-100">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleStartExam} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">ক্লাস</label>
              <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSubject(""); setSelectedChapter(""); }} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500">
                <option value="">ক্লাস বাছুন</option>
                {rawCurriculum.classes.map((c: any) => <option key={c.class} value={c.class}>{classLabelMap[c.class] || c.class}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">বিষয়</label>
              <select disabled={!selectedClass} value={selectedSubject} onChange={(e) => { setSelectedSubject(e.target.value); setSelectedChapter(""); }} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500">
                <option value="">বিষয় নির্বাচন করুন</option>
                {availableSubjects.map((sub: any) => <option key={sub.name} value={sub.name}>{sub.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">অধ্যায়</label>
              {availableChapters.length > 0 ? (
                <select disabled={!selectedSubject} value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500">
                  <option value="">সম্পূর্ণ বই / সকল অধ্যায়</option>
                  {availableChapters.map((chap: string) => <option key={chap} value={chap}>{chap}</option>)}
                  <option value="custom">✏️ নিজের মতো টপিক লিখুন...</option>
                </select>
              ) : (
                <input type="text" placeholder="অধ্যায় বা টপিকের নাম লিখুন" disabled={!selectedSubject} value={customChapter} onChange={(e) => setCustomChapter(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
              )}
              {selectedChapter === "custom" && (
                <input type="text" placeholder="নির্দিষ্ট টপিক বা অধ্যায়ের নাম..." value={customChapter} onChange={(e) => setCustomChapter(e.target.value)} className="mt-2 w-full rounded-xl border border-blue-300 bg-blue-50/30 px-4 py-2.5 text-sm outline-none focus:border-blue-500" autoFocus />
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">প্রশ্নের ধরন</label>
              <select value={questionType} onChange={(e) => setQuestionType(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500">
                <option value="MCQ">📝 শুধু MCQ (বহুনির্বাচনি)</option>
                <option value="SHORT">✍️ শুধু সংক্ষিপ্ত প্রশ্ন</option>
                <option value="CQ">🧠 শুধু সৃজনশীল প্রশ্ন</option>
                <option value="MIXED">🎲 মিক্স (MCQ + সংক্ষিপ্ত + সৃজনশীল)</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">কঠিনতা</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none">
                  <option value="সহজ">সহজ</option>
                  <option value="মাঝারি">মাঝারি</option>
                  <option value="কঠিন">কঠিন</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">প্রশ্ন সংখ্যা</label>
                <select value={count} onChange={(e) => setCount(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none">
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">ভাষা</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none">
                  <option value="বাংলা">বাংলা</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3.5 text-sm font-bold text-white shadow-md disabled:opacity-70">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              <span>{loading ? "প্রশ্ন তৈরি হচ্ছে..." : "এক ক্লিকে প্রশ্ন তৈরি করুন"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
