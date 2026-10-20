"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Trophy, Clock, RefreshCcw } from "lucide-react";

export const toBn = (n: number | string) =>
  n.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

export interface ExamQuestion {
  id: number | string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface StudentInfo {
  name: string;
  className: string;
  roll: string;
  institution?: string;
}

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
  const [timeLeft, setTimeLeft] = useState(timeInMinutes * 60);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [viewState, setViewState] = useState<"EXAM" | "RESULT" | "REVIEW" | "LEADERBOARD">("EXAM");
  const [expandedExplanation, setExpandedExplanation] = useState<Record<number, boolean>>({});

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const banglaOptions = ["ক", "খ", "গ", "ঘ"];
  const totalSeconds = timeInMinutes * 60;
  const timeSpent = totalSeconds - timeLeft;

  useEffect(() => {
    if (viewState !== "EXAM") return;
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
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

  const handleFinalSubmit = async () => {
    setShowWarningModal(false);
    setViewState("RESULT");

    let correct = 0;
    let wrong = 0;
    questions.forEach((q, idx) => {
      const ans = selectedAnswers[idx];
      if (ans !== undefined) {
        if (ans === q.correctAnswer) correct++;
        else wrong++;
      }
    });

    const finalScore = Number((correct * 1 - wrong * negativeMark).toFixed(2));

    try {
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examTitle,
          studentName: studentInfo?.name || "পরীক্ষার্থী",
          studentClass: studentInfo?.className || "সাধারণ",
          rollNumber: studentInfo?.roll || "১",
          institution: studentInfo?.institution || "",
          score: finalScore,
          totalMarks: questions.length,
          timeSpent: Math.max(1, timeSpent),
        }),
      });
    } catch (e) {
      console.error("Leaderboard save failed:", e);
    }
  };

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    setViewState("LEADERBOARD");
    try {
      const res = await fetch(`/api/leaderboard?examTitle=${encodeURIComponent(examTitle)}`);
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  let correct = 0;
  let wrong = 0;
  questions.forEach((q, idx) => {
    const ans = selectedAnswers[idx];
    if (ans !== undefined) {
      if (ans === q.correctAnswer) correct++;
      else wrong++;
    }
  });

  const obtainedMarks = Number((correct * 1 - wrong * negativeMark).toFixed(2));
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20 font-sans text-slate-800">
      
      {/* ১. পরীক্ষা স্ক্রিন */}
      {viewState === "EXAM" && (
        <>
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs font-semibold text-slate-700 truncate max-w-[140px]">
              {studentInfo?.name} (রোল: {toBn(studentInfo?.roll || "১")})
            </div>

            {/* Submit বাটনকে বাংলায় 'জমা দিন' করা হলো */}
            <button
              onClick={() => setShowWarningModal(true)}
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 px-6 py-1.5 text-sm font-bold text-white shadow-md active:scale-95 transition"
            >
              জমা দিন
            </button>

            <div className="text-right">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Clock size={13} className="text-indigo-600" />
                {toBn(formatTime(timeLeft))}
              </div>
              <div className="text-[10px] font-bold text-emerald-600">
                {toBn(answeredCount)} / {toBn(questions.length)}
              </div>
            </div>
          </div>

          <div className="mx-4 mt-3 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2 text-xs font-medium text-amber-900">
            প্রতি সঠিক উত্তরের মান ১ ও ভুল উত্তরের জন্য ০.৫০ কাটা যাবে।
          </div>

          <div className="mx-auto max-w-2xl px-4 py-4 space-y-4">
            {questions.map((q, qIndex) => {
              const selectedOpt = selectedAnswers[qIndex];
              return (
                <div key={qIndex} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 leading-relaxed mb-4">
                    {toBn(qIndex + 1)}) {q.question}
                  </h3>
                  <div className="space-y-2.5">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = selectedOpt === optIndex;
                      return (
                        <div
                          key={optIndex}
                          onClick={() => handleSelectOption(qIndex, optIndex)}
                          className={`flex items-center gap-3 rounded-xl p-2.5 cursor-pointer transition ${
                            isSelected
                              ? "bg-indigo-50/90 border border-indigo-300 font-semibold text-indigo-950"
                              : "hover:bg-slate-50 border border-transparent text-slate-800"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              isSelected ? "bg-indigo-600 text-white shadow" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {banglaOptions[optIndex]}
                          </span>
                          <span className="text-sm">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ২. সাবমিট সতর্কতা মোডাল (সম্পূর্ণ বাংলায়) */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">সতর্কবার্তা</h2>
            <div className="my-5 space-y-1.5 text-sm text-slate-600">
              <p>মোট প্রশ্ন: <span className="font-bold text-slate-800">{toBn(questions.length)}টি</span></p>
              <p>উত্তর দিয়েছেন: <span className="font-bold text-emerald-600">{toBn(answeredCount)}টি</span></p>
              <p className="text-red-500 font-bold">বাকি আছে: {toBn(questions.length - answeredCount)}টি</p>
              <p className="pt-2 text-xs text-slate-500">আপনি কি উত্তরপত্রটি জমা দিতে চান?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWarningModal(false)}
                className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-sm font-bold text-slate-700"
              >
                না
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-sm font-bold text-white shadow-md"
              >
                হ্যাঁ, জমা দিন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ৩. ফলাফল পেজ */}
      {viewState === "RESULT" && (
        <div className="mx-auto max-w-2xl px-4 py-4 space-y-4">
          <div className="rounded-2xl bg-indigo-600 p-4 text-center text-white font-bold text-lg shadow-md flex items-center justify-between">
            <span className="text-sm font-normal">পরীক্ষার্থী: {studentInfo?.name}</span>
            <span>ফলাফল</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">রোল: {toBn(studentInfo?.roll || "১")}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-center">
              <div className="text-xs text-slate-600 font-medium">সঠিক উত্তর</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{toBn(correct)}</div>
            </div>
            <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-center">
              <div className="text-xs text-slate-600 font-medium">ভুল উত্তর</div>
              <div className="text-2xl font-bold text-rose-600 mt-1">{toBn(wrong)}</div>
            </div>
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-center">
              <div className="text-xs text-slate-600 font-medium">সময় লেগেছে</div>
              <div className="text-xl font-bold text-blue-600 mt-1">{toBn(formatTime(timeSpent))} মিনিট</div>
            </div>
            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-center">
              <div className="text-xs text-slate-600 font-medium">আপনার প্রাপ্ত মার্কস</div>
              <div className={`text-2xl font-bold mt-1 ${obtainedMarks >= 0 ? "text-indigo-600" : "text-red-500"}`}>
                {toBn(obtainedMarks)}
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={fetchLeaderboard}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3.5 text-sm font-bold shadow-md transition active:scale-98"
            >
              <Trophy size={18} />
              <span>মেরিট লিস্ট / লিডারবোর্ড দেখুন</span>
            </button>

            <button
              onClick={() => setViewState("REVIEW")}
              className="w-full rounded-2xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 py-3 text-sm font-bold text-indigo-900 transition"
            >
              উত্তরপত্র দেখুন
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-2xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-600 transition"
            >
              নতুন পরীক্ষা দিন
            </button>
          </div>
        </div>
      )}

      {/* ৪. লিডারবোর্ড স্ক্রিন */}
      {viewState === "LEADERBOARD" && (
        <div className="mx-auto max-w-2xl px-4 py-4 space-y-4">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-700 to-blue-700 p-4 text-white shadow-md flex items-center justify-between">
            <button onClick={() => setViewState("RESULT")} className="p-1 rounded-lg hover:bg-white/10">
              <ArrowLeft size={20} />
            </button>
            <div className="text-center">
              <h2 className="text-base font-bold flex items-center justify-center gap-1.5">
                <Trophy size={18} className="text-amber-300" /> মেরিট লিস্ট
              </h2>
              <p className="text-[11px] text-blue-200 truncate max-w-[200px]">{examTitle}</p>
            </div>
            <button onClick={fetchLeaderboard} className="p-1.5 rounded-lg hover:bg-white/10 text-xs">
              <RefreshCcw size={16} />
            </button>
          </div>

          {loadingLeaderboard ? (
            <div className="text-center py-12 text-sm text-slate-500">লিডারবোর্ড লোড হচ্ছে...</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-sm text-slate-500">
              এখনো কোনো রেজাল্ট জমা পড়েনি।
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {leaderboard.slice(0, 3).map((u, i) => {
                  const medals = ["🥇 ১ম স্থান", "🥈 ২য় স্থান", "🥉 ৩য় স্থান"];
                  const colors = ["border-amber-300 bg-amber-50/70", "border-slate-300 bg-slate-50/70", "border-orange-300 bg-orange-50/70"];
                  return (
                    <div key={i} className={`rounded-2xl border p-2.5 text-center shadow-xs flex flex-col justify-between ${colors[i]}`}>
                      <span className="text-[11px] font-bold text-slate-700">{medals[i]}</span>
                      <div className="my-1.5">
                        <div className="text-xs font-bold text-slate-900 truncate">{u.studentName}</div>
                        <div className="text-[10px] text-slate-500">রোল: {toBn(u.rollNumber)}</div>
                      </div>
                      <div className="text-sm font-extrabold text-indigo-700">{toBn(u.score)}</div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-600 flex justify-between">
                  <span>র‍্যাংক ও নাম</span>
                  <span>মার্কস ও সময়</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {leaderboard.map((item, idx) => {
                    const isMe = item.studentName === studentInfo?.name && String(item.rollNumber) === String(studentInfo?.roll);
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 text-xs transition ${
                          isMe ? "bg-indigo-50/80 font-semibold border-l-4 border-indigo-600" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                            idx === 0 ? "bg-amber-400 text-white" : idx === 1 ? "bg-slate-400 text-white" : idx === 2 ? "bg-orange-400 text-white" : "bg-slate-100 text-slate-600"
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 truncate flex items-center gap-1">
                              {item.studentName} {isMe && <span className="text-[10px] text-indigo-600 font-bold">(আপনি)</span>}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              রোল: {toBn(item.rollNumber)} {item.institution ? `• ${item.institution}` : ""}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold text-indigo-600 text-sm">{toBn(item.score)}</div>
                          <div className="text-[10px] text-slate-400">{toBn(formatTime(item.timeSpent))} মি.</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <button
            onClick={() => setViewState("RESULT")}
            className="w-full rounded-2xl bg-slate-100 hover:bg-slate-200 py-3 text-xs font-bold text-slate-700 transition"
          >
            ফলাফলে ফিরে যান
          </button>
        </div>
      )}

      {/* ৫. উত্তরপত্র ও ব্যাখ্যা */}
      {viewState === "REVIEW" && (
        <div className="mx-auto max-w-2xl px-4 py-4 space-y-4">
          <div className="rounded-2xl bg-indigo-600 p-4 text-center text-white font-bold text-lg shadow-md flex items-center justify-between">
            <button onClick={() => setViewState("RESULT")} className="p-1 rounded-lg hover:bg-white/10">
              <ArrowLeft size={20} />
            </button>
            <span>উত্তরপত্র</span>
            <div className="w-5" />
          </div>

          <div className="space-y-4">
            {questions.map((q, qIndex) => {
              const userAns = selectedAnswers[qIndex];
              const isUnanswered = userAns === undefined;
              const isCorrect = userAns === q.correctAnswer;
              const showExp = expandedExplanation[qIndex];

              return (
                <div key={qIndex} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {toBn(qIndex + 1)}) {q.question}
                    </h3>
                    {isUnanswered && (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        উত্তর করেননি
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => {
                      const isThisCorrect = optIndex === q.correctAnswer;
                      const isThisUserWrong = !isCorrect && userAns === optIndex;

                      let rowClass = "border-transparent bg-slate-50/50";
                      let badgeClass = "bg-slate-200 text-slate-600";

                      if (isThisCorrect) {
                        rowClass = "bg-amber-100/70 border border-amber-200 font-semibold text-amber-950";
                        badgeClass = "bg-amber-300 text-amber-900";
                      } else if (isThisUserWrong) {
                        rowClass = "bg-rose-100/70 border border-rose-200 text-rose-950 font-semibold";
                        badgeClass = "bg-rose-500 text-white";
                      }

                      return (
                        <div key={optIndex} className={`flex items-center gap-3 rounded-xl p-2.5 border transition ${rowClass}`}>
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${badgeClass}`}>
                            {banglaOptions[optIndex]}
                          </span>
                          <span className="text-sm flex-1">{opt}</span>
                          {isThisUserWrong && <span className="text-[11px] font-bold text-red-600">(আপনার উত্তর)</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setExpandedExplanation((prev) => ({ ...prev, [qIndex]: !prev[qIndex] }))}
                      className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-1.5 text-xs font-bold text-slate-700 transition"
                    >
                      {showExp ? "ব্যাখ্যা বন্ধ করুন" : "ব্যাখ্যা"}
                    </button>
                    {showExp && (
                      <div className="mt-3 rounded-xl bg-blue-50/80 border border-blue-100 p-3.5 text-xs text-slate-700 leading-relaxed">
                        <span className="font-bold text-blue-900 block mb-1">💡 সঠিক উত্তরের ব্যাখ্যা:</span>
                        {q.explanation || "এই প্রশ্নের জন্য কোনো অতিরিক্ত ব্যাখ্যা দেওয়া নেই।"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
