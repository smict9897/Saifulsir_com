"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Trophy, Clock, RefreshCcw } from "lucide-react";
import MathText from "@/components/MathText";

export const toBn = (n: number | string) => n.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

export interface ExamQuestion {
  id: number | string;
  type?: "MCQ" | "SHORT" | "CQ";
  question?: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  answer?: string; // SHORT
  stimulus?: string; // CQ
  subQuestions?: { k: string; kh: string; g: string; gh: string }; // CQ
}

export interface StudentInfo { name: string; className: string; roll: string; institution?: string; }

interface LiveExamProps {
  examTitle?: string;
  questions: ExamQuestion[];
  timeInMinutes?: number;
  negativeMark?: number;
  studentInfo?: StudentInfo;
}

export default function LiveExamPlayer({
  examTitle = "অনলাইন মডেল টেস্ট",
  questions = [],
  timeInMinutes = 20,
  negativeMark = 0.5,
  studentInfo = { name: "পরীক্ষার্থী", className: "সাধারণ", roll: "১" },
}: LiveExamProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(timeInMinutes * 60);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [viewState, setViewState] = useState<"EXAM" | "RESULT" | "REVIEW" | "LEADERBOARD">("EXAM");
  
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const banglaOptions = ["ক", "খ", "গ", "ঘ"];
  const totalSeconds = timeInMinutes * 60;
  const timeSpent = totalSeconds - timeLeft;

  useEffect(() => {
    if (viewState !== "EXAM") return;
    if (timeLeft <= 0) { handleFinalSubmit(); return; }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, viewState]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`;
  };

  const handleSelectOption = (qIndex: number, optIndex: number) => {
    if (viewState !== "EXAM") return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleTextChange = (qIndex: number, val: string) => {
    if (viewState !== "EXAM") return;
    setTextAnswers((prev) => ({ ...prev, [qIndex]: val }));
  };

  const handleFinalSubmit = async () => {
    setShowWarningModal(false); setViewState("RESULT");
    let correct = 0; let wrong = 0;
    questions.forEach((q, idx) => {
      if (q.type === "MCQ" || (!q.type && q.options)) {
        const ans = selectedAnswers[idx];
        if (ans !== undefined) { if (ans === q.correctAnswer) correct++; else wrong++; }
      }
    });
    const finalScore = Number((correct * 1 - wrong * negativeMark).toFixed(2));
    try {
      await fetch("/api/leaderboard", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examTitle, studentName: studentInfo?.name, studentClass: studentInfo?.className, rollNumber: studentInfo?.roll, institution: studentInfo?.institution, score: finalScore, totalMarks: questions.length, timeSpent: Math.max(1, timeSpent) }),
      });
    } catch (e) { console.error(e); }
  };

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true); setViewState("LEADERBOARD");
    try {
      const res = await fetch(`/api/leaderboard?examTitle=${encodeURIComponent(examTitle)}`);
      const data = await res.json();
      if (data.success) setLeaderboard(data.leaderboard || []);
    } catch (e) { console.error(e); } finally { setLoadingLeaderboard(false); }
  };

  let correct = 0; let wrong = 0;
  questions.forEach((q, idx) => {
    if (q.type === "MCQ" || (!q.type && q.options)) {
      const ans = selectedAnswers[idx];
      if (ans !== undefined) { if (ans === q.correctAnswer) correct++; else wrong++; }
    }
  });
  const obtainedMarks = Number((correct * 1 - wrong * negativeMark).toFixed(2));
  const answeredCount = Object.keys(selectedAnswers).length + Object.keys(textAnswers).length;

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20 font-sans text-slate-800">
      {viewState === "EXAM" && (
        <>
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs font-semibold truncate max-w-[140px]">{studentInfo?.name} (রোল: {toBn(studentInfo?.roll)})</div>
            <button onClick={() => setShowWarningModal(true)} className="rounded-full bg-indigo-600 px-6 py-1.5 text-sm font-bold text-white shadow-md">জমা দিন</button>
            <div className="text-right">
              <div className="text-xs font-bold flex items-center gap-1"><Clock size={13} /> {toBn(formatTime(timeLeft))}</div>
              <div className="text-[10px] font-bold text-emerald-600">{toBn(answeredCount)} / {toBn(questions.length)}</div>
            </div>
          </div>

          <div className="mx-auto max-w-2xl px-4 py-4 space-y-4">
            {questions.map((q, qIndex) => {
              const isMcq = q.type === "MCQ" || (!q.type && q.options);
              const isShort = q.type === "SHORT";
              const isCq = q.type === "CQ" || (!q.type && q.subQuestions);

              return (
                <div key={qIndex} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  {isMcq && q.options && (
                    <>
                      <h3 className="text-base font-bold mb-4">{toBn(qIndex + 1)}) <MathText text={q.question || ""} /></h3>
                      <div className="space-y-2.5">
                        {q.options.map((opt, optIndex) => {
                          const isSelected = selectedAnswers[qIndex] === optIndex;
                          return (
                            <div key={optIndex} onClick={() => handleSelectOption(qIndex, optIndex)} className={`flex items-center gap-3 rounded-xl p-2.5 cursor-pointer ${isSelected ? "bg-indigo-50 border-indigo-300 font-semibold" : "hover:bg-slate-50"}`}>
                              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100"}`}>{banglaOptions[optIndex]}</span>
                              <div className="text-sm flex-1"><MathText text={opt} /></div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {isShort && (
                    <>
                      <h3 className="text-base font-bold mb-3">{toBn(qIndex + 1)}) <MathText text={q.question || ""} /></h3>
                      <textarea rows={3} placeholder="উত্তর লিখুন..." value={textAnswers[qIndex] || ""} onChange={(e) => handleTextChange(qIndex, e.target.value)} className="w-full rounded-xl border p-3 text-sm outline-none focus:border-indigo-500 bg-slate-50" />
                    </>
                  )}

                  {isCq && q.subQuestions && (
                    <>
                      <div className="mb-3 rounded-xl bg-slate-50 p-3 text-sm"><span className="font-bold">উদ্দীপক: </span><MathText text={q.stimulus || ""} /></div>
                      <div className="space-y-3">
                        {(["k", "kh", "g", "gh"] as const).map((key, i) => (
                          <div key={key}>
                            <p className="text-sm font-bold mb-1">({banglaOptions[i]}) <MathText text={q.subQuestions![key]} /></p>
                            <textarea rows={2} placeholder="উত্তর লিখুন..." value={textAnswers[qIndex * 10 + i] || ""} onChange={(e) => handleTextChange(qIndex * 10 + i, e.target.value)} className="w-full rounded-xl border p-2.5 text-sm outline-none focus:border-indigo-500 bg-slate-50" />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <h2 className="text-xl font-bold pb-3">সতর্কবার্তা</h2>
            <div className="my-5 space-y-1.5 text-sm">মোট প্রশ্ন: {toBn(questions.length)}টি, উত্তর দিয়েছেন: {toBn(answeredCount)}টি</div>
            <div className="flex gap-3">
              <button onClick={() => setShowWarningModal(false)} className="flex-1 rounded-xl bg-slate-100 py-3 font-bold">না</button>
              <button onClick={handleFinalSubmit} className="flex-1 rounded-xl bg-indigo-600 py-3 font-bold text-white">হ্যাঁ, জমা দিন</button>
            </div>
          </div>
        </div>
      )}

      {viewState === "RESULT" && (
        <div className="mx-auto max-w-2xl px-4 py-4 space-y-4">
          <div className="rounded-2xl bg-indigo-600 p-4 text-center text-white font-bold text-lg shadow-md">ফলাফল (MCQ)</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-50 p-4 text-center"><div className="text-xs">সঠিক</div><div className="text-2xl font-bold text-emerald-600">{toBn(correct)}</div></div>
            <div className="rounded-2xl bg-rose-50 p-4 text-center"><div className="text-xs">ভুল</div><div className="text-2xl font-bold text-rose-600">{toBn(wrong)}</div></div>
            <div className="rounded-2xl bg-blue-50 p-4 text-center"><div className="text-xs">সময়</div><div className="text-xl font-bold text-blue-600">{toBn(formatTime(timeSpent))}</div></div>
            <div className="rounded-2xl bg-amber-50 p-4 text-center"><div className="text-xs">প্রাপ্ত মার্কস</div><div className="text-2xl font-bold text-indigo-600">{toBn(obtainedMarks)}</div></div>
          </div>
          <div className="space-y-2.5 pt-2">
            <button onClick={fetchLeaderboard} className="w-full flex justify-center items-center gap-2 rounded-2xl bg-amber-500 py-3.5 font-bold text-white"><Trophy size={18} /> মেরিট লিস্ট</button>
            <button onClick={() => setViewState("REVIEW")} className="w-full rounded-2xl bg-indigo-50 py-3 font-bold text-indigo-900 border border-indigo-200">উত্তরপত্র দেখুন</button>
            <button onClick={() => window.location.reload()} className="w-full rounded-2xl bg-slate-100 py-2.5 text-xs font-bold text-slate-600">নতুন পরীক্ষা</button>
          </div>
        </div>
      )}

      {viewState === "LEADERBOARD" && (
        <div className="mx-auto max-w-2xl px-4 py-4 space-y-4">
          <div className="rounded-2xl bg-indigo-700 p-4 text-white flex justify-between items-center">
            <button onClick={() => setViewState("RESULT")}><ArrowLeft size={20} /></button>
            <span className="font-bold flex items-center gap-1"><Trophy size={18} /> মেরিট লিস্ট</span>
            <button onClick={fetchLeaderboard}><RefreshCcw size={16} /></button>
          </div>
          <div className="rounded-2xl border bg-white p-3">
            {loadingLeaderboard ? <p className="text-center text-sm">লোড হচ্ছে...</p> : leaderboard.map((item, idx) => (
              <div key={idx} className="flex justify-between border-b py-2 text-xs"><span>{idx + 1}. {item.studentName}</span><span className="font-bold">{toBn(item.score)}</span></div>
            ))}
          </div>
          <button onClick={() => setViewState("RESULT")} className="w-full rounded-2xl bg-slate-100 py-3 font-bold text-xs">ফিরে যান</button>
        </div>
      )}

      {viewState === "REVIEW" && (
        <div className="mx-auto max-w-2xl px-4 py-4 space-y-4">
          <div className="rounded-2xl bg-indigo-600 p-4 text-white flex justify-between items-center">
            <button onClick={() => setViewState("RESULT")}><ArrowLeft size={20} /></button>
            <span className="font-bold">উত্তরপত্র</span><div className="w-5" />
          </div>
          <div className="space-y-4">
            {questions.map((q, qIndex) => {
              const isMcq = q.type === "MCQ" || (!q.type && q.options);
              if (!isMcq) return <div key={qIndex} className="rounded-2xl border p-4 bg-white opacity-70 text-sm font-bold">{toBn(qIndex + 1)}) {q.type === "SHORT" ? "সংক্ষিপ্ত প্রশ্ন" : "সৃজনশীল প্রশ্ন"} (শিক্ষক মূল্যায়ন করবেন)</div>;
              const userAns = selectedAnswers[qIndex];
              const isCorrect = userAns === q.correctAnswer;
              return (
                <div key={qIndex} className="rounded-2xl border p-4 bg-white text-sm">
                  <h3 className="font-bold mb-2">{toBn(qIndex + 1)}) <MathText text={q.question || ""} /></h3>
                  <p className={`font-bold ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}>আপনার উত্তর: {userAns !== undefined ? banglaOptions[userAns] : "দেননি"} | সঠিক: {banglaOptions[q.correctAnswer!]}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
