"use client";

import { useState, useMemo, useEffect } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Clock, CheckCheck, XCircle, ListTodo } from "lucide-react";
import { useRouter } from "next/navigation";
import { NCTB_CLASSES } from "@/lib/nctb-data";

export default function AdminAIGenerator() {
  const router = useRouter();
  
  const [category, setCategory] = useState(NCTB_CLASSES[0]?.class || "Class 9-10");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [isAllTopics, setIsAllTopics] = useState(false);
  const [type, setType] = useState<"BLOG" | "MCQ">("BLOG");
  const [prompt, setPrompt] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);

  const [stats, setStats] = useState({ pending: 0, processing: 0, completed: 0, failed: 0 });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const availableSubjects = useMemo(() => {
    const foundClass = NCTB_CLASSES.find((c) => c.class === category);
    return foundClass ? foundClass.subjects : [];
  }, [category]);

  const availableTopics = useMemo(() => {
    const foundSubject = availableSubjects.find((s) => s.name === subject);
    return foundSubject ? foundSubject.chapters : [];
  }, [availableSubjects, subject]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/ai-status");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentTasks(data.recentTasks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setSubject("");
    setTopic("");
    setIsAllTopics(false);
  };

  // 🎯 নতুন অটো-প্রসেসিং লজিক
  const handleGenerate = async () => {
    if (!subject) {
      setStatus({ type: "error", msg: "অনুগ্রহ করে বিষয় নির্বাচন করুন।" });
      return;
    }

    let finalTopics: string[] = [];
    if (isAllTopics) finalTopics = availableTopics; 
    else if (topic) finalTopics = [topic]; 
    else finalTopics = ["সকল অধ্যায়"]; 

    setLoading(true);
    setStatus({ type: "info", msg: "কাজ লাইনে যোগ করা হচ্ছে..." });

    try {
      // ১. ডাটাবেজে কাজ জমা দেওয়া
      const res = await fetch("/api/admin/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type, category, subject, topics: finalTopics }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus({ type: "info", msg: "কাজ সফলভাবে জমা হয়েছে। এআই একের পর এক অংশ তৈরি করছে... (দয়া করে অপেক্ষা করুন)" });
        setPrompt(""); 
        setTopic("");
        setIsAllTopics(false);
        fetchStats(); 

        // 🎯 ২. অটোমেটিক লুপ: যতক্ষণ কাজ বাকি আছে, ততক্ষণ একের পর এক এপিআই কল হবে
        let hasMoreTasks = true;
        while (hasMoreTasks) {
          try {
            const workerRes = await fetch("/api/admin/ai-worker");
            const workerText = await workerRes.text();

            if (workerText.includes("No Task")) {
              hasMoreTasks = false; // সব কাজ শেষ
              setStatus({ type: "success", msg: "🎉 আপনার সব কাজ সফলভাবে সম্পন্ন হয়েছে এবং ড্রাফটে সেভ হয়েছে!" });
            } else if (workerText.includes("Error")) {
              hasMoreTasks = false; // কোনো এরর হলে থেমে যাবে
              setStatus({ type: "error", msg: `সমস্যা হয়েছে: ${workerText}` });
            } else {
              // সফলভাবে একটি পার্ট তৈরি হলো, স্ট্যাটাস আপডেট হবে এবং লুপ চলবে
              fetchStats();
              setStatus({ type: "info", msg: "একটি অংশ তৈরি হলো, পরের অংশ তৈরি হচ্ছে..." });
            }
          } catch (err) {
            hasMoreTasks = false;
            setStatus({ type: "error", msg: "নেটওয়ার্ক সমস্যা হয়েছে।" });
          }
        }
        
        router.refresh();
      } else {
        setStatus({ type: "error", msg: data.error || "কিছু ভুল হয়েছে।" });
      }
    } catch (error: any) {
      setStatus({ type: "error", msg: "সার্ভারে সমস্যা হয়েছে।" });
    } finally {
      setLoading(false);
    }
  };

  const noTask = !isInitialLoad && stats.pending === 0 && stats.processing === 0 && stats.completed === 0 && stats.failed === 0;
  const allTasksCompleted = !isInitialLoad && stats.pending === 0 && stats.processing === 0 && (stats.completed > 0 || stats.failed > 0);

  return (
    <div className="space-y-4 mb-6">
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-blue-900">
          <Sparkles size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold">AI অটো-জেনারেটর (এক ক্লিকে সম্পূর্ণ)</h2>
        </div>
        
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">কী তৈরি করতে চান?</label>
            <div className="flex gap-2 mt-1">
              <button onClick={() => setType("BLOG")} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${type === "BLOG" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-300"}`}>📝 ব্লগ পোস্ট</button>
              <button onClick={() => setType("MCQ")} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${type === "MCQ" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-300"}`}>🎯 MCQ প্রশ্ন</button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">ক্লাস</label>
            <select value={category} onChange={handleClassChange} className="w-full rounded-lg border border-blue-200 p-2 text-sm mt-1 bg-white outline-none focus:border-blue-500">
              {NCTB_CLASSES.map((c) => <option key={c.class} value={c.class}>{c.class}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">বিষয়</label>
            <select value={subject} onChange={(e) => { setSubject(e.target.value); setTopic(""); setIsAllTopics(false); }} className="w-full rounded-lg border border-blue-200 p-2 text-sm mt-1 bg-white outline-none focus:border-blue-500">
              <option value="">-- বিষয় বাছুন --</option>
              {availableSubjects.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2 bg-blue-100/50 p-3 rounded-xl border border-blue-200">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" checked={isAllTopics} onChange={(e) => setIsAllTopics(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" disabled={!subject || availableTopics.length === 0} />
              <span className="text-sm font-bold text-blue-900">এই বিষয়ের সবগুলো অধ্যায়ের জন্য একসাথে কাজ দিন</span>
            </label>
            {!isAllTopics && (
              <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full rounded-lg border border-blue-200 p-2 text-sm bg-white outline-none focus:border-blue-500" disabled={!subject || availableTopics.length === 0}>
                <option value="">-- নির্দিষ্ট অধ্যায় বাছুন --</option>
                {availableTopics.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="বাড়তি কোনো নির্দেশনা (যেমন: ২০০০ শব্দের মাস্টার প্রম্পট)..." rows={3} className="w-full rounded-xl border border-blue-200 bg-white p-3 text-sm outline-none focus:border-blue-500" disabled={loading} />
          
          <button onClick={handleGenerate} disabled={loading || !subject} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? "এআই কাজ করছে (বন্ধ করবেন না)..." : "এক ক্লিকে সম্পূর্ণ তৈরি করুন"}
          </button>
        </div>

        {status && (
          <div className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm font-semibold ${
            status.type === "success" ? "bg-green-100 text-green-800 border-green-200" : 
            status.type === "error" ? "bg-red-100 text-red-800 border-red-200" :
            "bg-blue-100 text-blue-800 border-blue-200"
          }`}>
            {status.type === "success" ? <CheckCircle2 size={18} /> : status.type === "error" ? <AlertCircle size={18} /> : <Loader2 size={18} className="animate-spin" />}
            <span>{status.msg}</span>
          </div>
        )}
      </div>

      {/* স্ট্যাটাস ড্যাশবোর্ড */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
          <span>কাজের বর্তমান অবস্থা (Task Status)</span>
          <span className="text-[10px] text-slate-400 font-normal">(প্রতি ১০ সেকেন্ডে আপডেট হয়)</span>
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-orange-50 rounded-xl p-3 border border-orange-100 flex items-center gap-3">
            <Clock size={20} className="text-orange-500" />
            <div><p className="text-xs text-slate-500">Pending</p><p className="text-lg font-bold text-orange-600">{stats.pending}</p></div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 flex items-center gap-3">
            <Loader2 size={20} className="text-blue-500" />
            <div><p className="text-xs text-slate-500">Processing</p><p className="text-lg font-bold text-blue-600">{stats.processing}</p></div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 border border-green-100 flex items-center gap-3">
            <CheckCheck size={20} className="text-green-500" />
            <div><p className="text-xs text-slate-500">Completed</p><p className="text-lg font-bold text-green-600">{stats.completed}</p></div>
          </div>
          <div className="bg-red-50 rounded-xl p-3 border border-red-100 flex items-center gap-3">
            <XCircle size={20} className="text-red-500" />
            <div><p className="text-xs text-slate-500">Failed</p><p className="text-lg font-bold text-red-600">{stats.failed}</p></div>
          </div>
        </div>

        {noTask && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm font-bold text-slate-600">
            <ListTodo size={18} className="text-slate-500" />
            <span>No Task (এখন কোনো কাজ অপেক্ষায় বা চলমান নেই)</span>
          </div>
        )}

        {allTasksCompleted && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm font-bold text-green-700 shadow-sm">
            <CheckCircle2 size={18} className="text-green-600" />
            <span>🎉 Your all task is completed! (আপনার সব কাজ সফলভাবে সম্পন্ন হয়েছে)</span>
          </div>
        )}
      </div>
    </div>
  );
}
