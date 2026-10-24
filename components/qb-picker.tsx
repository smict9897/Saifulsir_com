"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, CheckSquare, Square, Trash2 } from "lucide-react";
import Link from "next/link";

export default function QbPicker() {
  // 🎯 ট্যাব ফিল্টার
  const [activeTab, setActiveTab] = useState<"MCQ" | "SHORT" | "CQ">("MCQ");
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // ডেমো ডাটা লোড (আপনার আসল API ফেচিং এখানে বসবে)
  useEffect(() => {
    // ধরুন এখানে API থেকে ডাটা আসছে
    setLoading(false);
  }, []);

  // 🎯 ট্যাব অনুযায়ী প্রশ্ন ফিল্টার
  const filteredQuestions = questions.filter((q) => {
    const matchesTab = q.type === activeTab;
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === filteredQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map((q) => q.id));
    }
  };

  const handleProceed = () => {
    // লোকাল স্টোরেজে সেভ করে পরের পেজে পাঠানো
    localStorage.setItem("qb:selected", JSON.stringify(selectedIds));
    window.location.href = "/qb-builder";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        
        <h1 className="text-2xl font-extrabold text-slate-900">৮ • তথ্য ও যোগাযোগ প্রযুক্তি</h1>

        {/* সার্চ বার */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="এখানে খুঁজুন"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-10 text-sm outline-none focus:border-blue-500"
            />
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
          </div>
          <button className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm">খুঁজুন</button>
        </div>

        {/* মোট প্রশ্ন */}
        <div className="flex justify-between items-center text-sm font-bold text-slate-700 mt-4">
          <span>মোট {filteredQuestions.length} টি প্রশ্ন</span>
        </div>

        {/* 🎯 ট্যাবগুলো: বহুনির্বাচনি, সংক্ষিপ্ত, সৃজনশীল */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("MCQ")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === "MCQ" ? "bg-blue-600 text-white shadow-md" : "bg-white border text-slate-700"
            }`}
          >
            বহুনির্বাচনি
          </button>
          <button
            onClick={() => setActiveTab("SHORT")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === "SHORT" ? "bg-emerald-600 text-white shadow-md" : "bg-white border text-slate-700"
            }`}
          >
            সংক্ষিপ্ত
          </button>
          <button
            onClick={() => setActiveTab("CQ")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === "CQ" ? "bg-indigo-600 text-white shadow-md" : "bg-white border text-slate-700"
            }`}
          >
            সৃজনশীল
          </button>
        </div>

        {/* কন্ট্রোল বাটন */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={selectAll} className="flex items-center gap-2 rounded-xl border border-dashed border-slate-400 bg-white px-4 py-2 text-sm font-semibold">
            {selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
            সব নির্বাচন (এই পাতা)
          </button>
          
          <button onClick={handleProceed} className="rounded-xl bg-amber-400 px-5 py-2 text-sm font-bold text-amber-950 shadow-sm">
            নির্বাচিত প্রশ্ন দেখুন ({selectedIds.length})
          </button>
          
          <button onClick={() => setSelectedIds([])} className="flex items-center gap-1 rounded-xl bg-pink-600 px-4 py-2 text-sm font-bold text-white shadow-sm">
            <Trash2 size={16} /> সব মুছুন
          </button>
        </div>

        {/* প্রশ্ন লিস্ট */}
        <div className="mt-6 space-y-3">
          {loading ? (
            <p className="text-center text-slate-500 py-10">লোড হচ্ছে...</p>
          ) : filteredQuestions.length === 0 ? (
            <p className="text-center text-slate-500 py-10 font-medium">কোনো প্রশ্ন পাওয়া যায়নি।</p>
          ) : (
            filteredQuestions.map((q) => (
              <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-start gap-3">
                <button onClick={() => toggleSelect(q.id)} className="mt-1 text-blue-600">
                  {selectedIds.includes(q.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{q.text}</p>
                  {activeTab === "MCQ" && q.options && (
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-600">
                      <span>(ক) {q.options.A}</span>
                      <span>(খ) {q.options.B}</span>
                      <span>(গ) {q.options.C}</span>
                      <span>(ঘ) {q.options.D}</span>
                    </div>
                  )}
                  {activeTab === "CQ" && q.subQuestions && (
                     <div className="mt-2 text-xs text-slate-600">
                        উদ্দীপক: {q.stimulus}
                     </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
