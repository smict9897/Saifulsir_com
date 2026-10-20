"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const toBn = (n: number | string) =>
  n.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

export interface ExamQuestion {
  id: number | string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface LiveExamProps {
  examTitle?: string;
  questions: ExamQuestion[];
  timeInMinutes?: number;
  negativeMark?: number;
}

export default function LiveExamPlayer({
  examTitle = "অনলাইন মডেল টেস্ট",
  questions = [],
  timeInMinutes = 20,
  negativeMark = 0.5,
}: LiveExamProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(timeInMinutes * 60);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [viewState, setViewState] = useState<"EXAM" | "RESULT" | "REVIEW">("EXAM");
  const [expandedExplanation, setExpandedExplanation] = useState<Record<number, boolean>>({});

  const banglaOptions = ["ক", "খ", "গ", "ঘ"];

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
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ""}${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`;
  };

  const handleSelectOption = (qIndex: number, optIndex: number) => {
    if (viewState !== "EXAM") return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleFinalSubmit = () => {
    setShowWarningModal(false);
    setViewState("RESULT");
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
      {/* ১. পরীক্ষা চলাকালীন স্ক্রিন */}
      {viewState === "EXAM" && (
        <>
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-sm font-semibold text-slate-700">≡ সকল প্রশ্ন</div>
            <button
              onClick={() => setShowWarningModal(true)}
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 px-6 py-1.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 active:scale-95 transition"
            >
              Submit
            </button>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800">{toBn(formatTime(timeLeft))}</div>
              <div className="text-[11px] font-bold text-emerald-600">
                {toBn(answeredCount)} of {toBn(questions.length)}
              </div>
            </div>
          </div>

          <div className="mx-4 mt-3 flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-xs font-medium text-amber-900">
            <span>প্রতি প্রশ্নের মান ১ ও ভুল উত্তরের জন্য ০.৫০ কাটা যাবে।</span>
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
                              ? "bg-indigo-50/80 border border-indigo-200"
                              : "hover:bg-slate-50 border border-transparent"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              isSelected ? "bg-indigo-600 text-white shadow" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {banglaOptions[optIndex]}
                          </span>
                          <span className={`text-sm ${isSelected ? "font-bold text-indigo-950" : "text-slate-800"}`}>
                            {opt}
                          </span>
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

      {/* ২. সাবমিট সতর্কতা মোডাল */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Warning!</h2>
            <div className="my-5 space-y-1.5 text-sm text-slate-600">
              <p>মোট প্রশ্ন সংখ্যা: <span className="font-bold text-slate-800">{toBn(questions.length)}টি</span></p>
              <p>আপনি উত্তর করেছেন: <span className="font-bold text-emerald-600">{toBn(answeredCount)}টি</span></p>
              <p className="text-red-500 font-bold">প্রশ্নের উত্তর বাকী আছে: {toBn(questions.length - answeredCount)}টি</p>
              <p className="pt-2 text-xs text-slate-500">আপনি কি উত্তরপত্রটি সাবমিট করতে চান?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWarningModal(false)}
                className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-sm font-bold text-slate-700 transition"
              >
                No
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-sm font-bold text-white shadow-md transition"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ৩. রেজাল্ট ও মার্কশিট */}
      {viewState === "RESULT" && (
        <div className="mx-auto max-w-2xl px-4 py-4 space-y-4">
          <div className="rounded-2xl bg-indigo-600 p-4 text-center text-white font-bold text-lg shadow-md flex items-center justify-between">
            <button onClick={() => setViewState("EXAM")} className="p-1 rounded-lg hover:bg-white/10">
              <ArrowLeft size={20} />
            </button>
            <span>Result</span>
            <div className="w-5" />
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
              <div className="text-xs text-slate-600 font-medium">মোট প্রশ্ন</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{toBn(questions.length)}</div>
            </div>
            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-center">
              <div className="text-xs text-slate-600 font-medium">আপনার মার্কস</div>
              <div className={`text-2xl font-bold mt-1 ${obtainedMarks >= 0 ? "text-indigo-600" : "text-red-500"}`}>
                {toBn(obtainedMarks)}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-sm text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-indigo-600" /> Mark Sheet
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">বিষয়</th>
                  <th className="py-2.5 px-3 text-center font-semibold">সঠিক</th>
                  <th className="py-2.5 px-3 text-center font-semibold">ভুল</th>
                  <th className="py-2.5 px-4 text-right font-semibold">মার্ক</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="bg-slate-50/80 font-bold text-slate-900">
                  <td className="py-3 px-4">{examTitle}</td>
                  <td className="py-3 px-3 text-center text-emerald-600">{toBn(correct)}</td>
                  <td className="py-3 px-3 text-center text-rose-600">{toBn(wrong)}</td>
                  <td className="py-3 px-4 text-right text-indigo-600">{toBn(obtainedMarks)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => setViewState("REVIEW")}
              className="w-full rounded-2xl bg-indigo-100 hover:bg-indigo-200 py-3.5 text-sm font-bold text-indigo-900 transition"
            >
              উত্তরপত্র দেখুন
            </button>
            <button
              onClick={() => {
                setSelectedAnswers({});
                setTimeLeft(timeInMinutes * 60);
                setViewState("EXAM");
              }}
              className="w-full rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 py-3 text-sm font-bold text-amber-900 transition"
            >
              আবার পরীক্ষা দিন
            </button>
          </div>
        </div>
      )}

      {/* ৪. উত্তরপত্র ও ব্যাখ্যা রিভিউ */}
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
