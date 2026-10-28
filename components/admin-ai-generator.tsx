
"use client";

import { useState, useMemo } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { NCTB_CLASSES } from "@/lib/nctb-data";

export default function AdminAIGenerator() {
  const router = useRouter();
  
  const [category, setCategory] = useState(NCTB_CLASSES[0]?.class || "Class 9-10");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [isAllTopics, setIsAllTopics] = useState(false); // 🎯 সব অধ্যায়ের জন্য চেকবক্স

  const [type, setType] = useState<"BLOG" | "MCQ">("BLOG");
  const [prompt, setPrompt] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const availableSubjects = useMemo(() => {
    const foundClass = NCTB_CLASSES.find((c) => c.class === category);
    return foundClass ? foundClass.subjects : [];
  }, [category]);

  const availableTopics = useMemo(() => {
    const foundSubject = availableSubjects.find((s) => s.name === subject);
    return foundSubject ? foundSubject.chapters : [];
  }, [availableSubjects, subject]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setSubject("");
    setTopic("");
    setIsAllTopics(false);
  };

  const handleGenerate = async () => {
    if (!subject) {
      setStatus({ type: "error", msg: "অনুগ্রহ করে বিষয় নির্বাচন করুন।" });
      return;
    }

    let finalTopics: string[] = [];
    if (isAllTopics) {
      finalTopics = availableTopics; // সব অধ্যায়
    } else if (topic) {
      finalTopics = [topic]; // শুধু সিলেক্ট করা অধ্যায়
    } else {
      finalTopics = ["সকল অধ্যায়"]; // যদি কিছুই সিলেক্ট না করে
    }

    if (finalTopics.length === 0) {
       setStatus({ type: "error", msg: "এই বিষয়ে কোনো অধ্যায় পাওয়া যায়নি।" });
       return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt, 
          type, 
          category, 
          subject, 
          topics: finalTopics // 🎯 এখানে অ্যারে পাঠানো হচ্ছে
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus({ 
          type: "success", 
          msg: `🎉 ${finalTopics.length} টি কাজ লাইনে যোগ হয়েছে! এআই এক এক করে ড্রাফট তৈরি করবে।` 
        });
        setPrompt(""); 
        setTopic("");
        setIsAllTopics(false);
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

  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm mb-6">
      <div className="mb-4 flex items-center gap-2 text-blue-900">
        <Sparkles size={20} className="text-blue-600" />
        <h2 className="text-lg font-bold">AI অটো-জেনারেটর (ব্যাচ মোড)</h2>
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
            <input 
              type="checkbox" 
              checked={isAllTopics} 
              onChange={(e) => setIsAllTopics(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
              disabled={!subject || availableTopics.length === 0}
            />
            <span className="text-sm font-bold text-blue-900">এই বিষয়ের সবগুলো অধ্যায়ের জন্য একসাথে কাজ দিন</span>
          </label>

          {!isAllTopics && (
            <select 
              value={topic} 
              onChange={(e) => setTopic(e.target.value)} 
              className="w-full rounded-lg border border-blue-200 p-2 text-sm bg-white outline-none focus:border-blue-500"
              disabled={!subject || availableTopics.length === 0}
            >
              <option value="">-- নির্দিষ্ট অধ্যায় বাছুন (ঐচ্ছিক) --</option>
              {availableTopics.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="বাড়তি কোনো নির্দেশনা (যেমন: ২০০০ শব্দের বিস্তারিত)..."
          rows={2}
          className="w-full rounded-xl border border-blue-200 bg-white p-3 text-sm outline-none focus:border-blue-500"
          disabled={loading}
        />
        
        <button
          onClick={handleGenerate}
          disabled={loading || !subject}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {loading ? "কাজ জমা হচ্ছে..." : (isAllTopics ? "সব অধ্যায়ের কাজ দিন" : "কাজ দিন (Queue)")}
        </button>
      </div>

      {status && (
        <div className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm font-semibold ${status.type === "success" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}>
          {status.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{status.msg}</span>
        </div>
      )}
    </div>
  );
}
