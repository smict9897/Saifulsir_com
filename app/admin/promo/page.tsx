"use client";

import React, { useState, useEffect } from "react";
import { 
  getPromoSettings, 
  savePromoSettings, 
  PromoSettings, 
  defaultPromo 
} from "@/app/actions/promo";
import { 
  Save, 
  BookOpen, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  DollarSign, 
  PhoneCall, 
  Eye 
} from "lucide-react";
import Link from "next/link";

export default function AdminPromoPage() {
  const [settings, setSettings] = useState<PromoSettings>(defaultPromo);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    
    getPromoSettings()
      .then((data) => {
        if (mounted) {
          setSettings(data || defaultPromo);
        }
      })
      .catch((err) => {
        console.error("Failed to load promo settings:", err);
      })
      .finally(() => {
        // 🎯 গ্যারান্টিড: কোনো অবস্থাতেই লোডার আটকে থাকবে না, সাথে সাথে পেজ চলে আসবে!
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (key: keyof PromoSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const res = await savePromoSettings(settings);
    setSaving(false);

    if (res.success) {
      setMsg({ type: "success", text: "সফলভাবে সেটিংস সেভ হয়েছে! হোমপেজে আপডেট দেখতে পাবেন।" });
    } else {
      setMsg({ type: "error", text: res.error || "সেভ ব্যর্থ হয়েছে" });
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            বই ও PDF বিক্রয় কন্ট্রোল প্যানেল
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            হোমপেজের প্রমোশনাল পপ-আপ এবং বইয়ের মূল্য ও ডেলিভারি নিয়ন্ত্রণ করুন
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <Eye size={15} /> হোমপেজে দেখুন
        </Link>
      </div>

      {msg && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-2xl p-4 text-xs font-bold border ${
            msg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {msg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ১. পপ-আপ অন/অফ সুইচ */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">হোমপেজ পপ-আপ সক্রিয় রাখুন</h3>
            <p className="text-xs text-slate-600 mt-0.5">অফ করে দিলে হোমপেজে শিক্ষার্থীদের সামনে পপ-আপটি আসবে না</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.active}
              onChange={(e) => handleChange("active", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* ২. বইয়ের বিবরণ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" /> বই ও অফারের তথ্য
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">অফার ব্যাজ (Badge)</label>
              <input
                type="text"
                value={settings.badge}
                onChange={(e) => handleChange("badge", e.target.value)}
                placeholder="যেমন: মেগা ছাড় অফার"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">বইয়ের কভার ছবির লিংক (URL)</label>
              <input
                type="text"
                value={settings.coverUrl}
                onChange={(e) => handleChange("coverUrl", e.target.value)}
                placeholder="https://... বা /images/book-cover.png"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">বই বা অফারের প্রধান শিরোনাম</label>
            <input
              type="text"
              required
              value={settings.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="বইয়ের আকর্ষণীয় নাম..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">উপ-শিরোনাম (Subtitle)</label>
            <input
              type="text"
              value={settings.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
              placeholder="১ লাইনের আকর্ষণীয় সুবিধা..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">সংক্ষিপ্ত বিবরণ (Description)</label>
            <textarea
              rows={3}
              value={settings.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="বইটিতে কী কী থাকবে..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* ৩. প্রাইসিং ও ডেলিভারি লিংক */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-600" /> মূল্য নির্ধারণ (PDF ও প্রিন্ট শিট)
          </h2>

          {/* PDF সংস্করণ */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                📱 ডিজিটাল PDF ই-বুক (ইনস্ট্যান্ট ডেলিভারি)
              </span>
              <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                প্রধান ফোকাস
              </span>
            </div>

            <div className="grid gap-3 grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">PDF অফার মূল্য (৳)</label>
                <input
                  type="number"
                  required
                  value={settings.pdfPrice}
                  onChange={(e) => handleChange("pdfPrice", Number(e.target.value))}
                  className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-emerald-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">আগের রেগুলার মূল্য (৳)</label>
                <input
                  type="number"
                  value={settings.pdfRegularPrice}
                  onChange={(e) => handleChange("pdfRegularPrice", Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Google Drive / PDF ডাউনলোড লিংক (পেমেন্টের পর ছাত্র পাবে)
              </label>
              <input
                type="url"
                value={settings.pdfDriveUrl}
                onChange={(e) => handleChange("pdfDriveUrl", e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* প্রিন্ট কপি সংস্করণ */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                📦 প্রিন্টেড হ্যান্ডনোট শিট (কুরিয়ার কপি)
              </span>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowPrint}
                  onChange={(e) => handleChange("allowPrint", e.target.checked)}
                  className="rounded text-blue-600"
                />
                প্রিন্ট অর্ডার চালু রাখুন
              </label>
            </div>

            {settings.allowPrint && (
              <div className="grid gap-3 grid-cols-2 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">প্রিন্ট অফার মূল্য (৳)</label>
                  <input
                    type="number"
                    value={settings.printPrice}
                    onChange={(e) => handleChange("printPrice", Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">রেগুলার মূল্য (৳)</label>
                  <input
                    type="number"
                    value={settings.printRegularPrice}
                    onChange={(e) => handleChange("printRegularPrice", Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ৪. পেমেন্ট নম্বর */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <PhoneCall size={18} className="text-pink-600" /> পেমেন্ট নম্বর (যেখানে ছাত্র টাকা পাঠাবে)
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">বিকাশ / নগদ / রকেট সেন্ড মানি নম্বর</label>
              <input
                type="text"
                value={settings.bkashNumber}
                onChange={(e) => handleChange("bkashNumber", e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-pink-600"
              />
            </div>
          </div>
        </div>

        {/* সেভ বাটন */}
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>সেটিংস সেভ ও লাইভ আপডেট করুন</span>
        </button>
      </form>
    </div>
  );
}
