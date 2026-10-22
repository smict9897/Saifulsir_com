"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllBooks, saveBookToStore, BookItem } from "@/app/actions/book";
import { uploadInline } from "@/app/actions/posts";
import { 
  BookOpen, Plus, Save, Loader2, UploadCloud, 
  CheckCircle2, AlertCircle, X, Eye, FileText, ArrowLeft 
} from "lucide-react";

// বাংলা সংখ্যা কনভার্টার
const toBn = (n: number | string) =>
  n.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

async function compressImage(file: File, maxSide = 1200, quality = 0.85): Promise<File> {
  try {
    if (!file.type.startsWith("image/")) return file;
    if (file.size <= 500_000 && ["image/jpeg", "image/png", "image/webp"].includes(file.type)) return file;
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", quality));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

export default function AdminBooksManager() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingSample, setUploadingSample] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // নতুন বইয়ের স্টেট
  const [formData, setFormData] = useState<Omit<BookItem, "id">>({
    title: "",
    author: "সাইফুল স্যার",
    category: "HSC",
    coverUrl: "",
    pdfPrice: 50,
    pdfRegularPrice: 100,
    printPrice: 200,
    printRegularPrice: 300,
    pdfDriveUrl: "",
    samplePages: [],
    description: "",
    pageCount: 120,
    publisher: "সাইফুল স্যার পাবলিকেশন্স",
    edition: "২০২৬-২০২৭ সংস্করণ",
  });

  const coverInputRef = useRef<HTMLInputElement>(null);
  const sampleInputRef = useRef<HTMLInputElement>(null);

  const fetchBooks = () => {
    setLoading(true);
    getAllBooks().then((data) => {
      setBooks(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // 🎯 কভার ছবি আপলোড হ্যান্ডলার (res.url এর টাইপ ফিক্স সহ)
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const small = await compressImage(file);
      const fd = new FormData();
      fd.set("image", small);
      fd.set("alt", "Book Flat Cover");
      const res = await uploadInline(fd);
      if (res && res.url) {
        setFormData((prev) => ({ ...prev, coverUrl: res.url as string }));
      }
    } catch (err: any) {
      alert("ছবি আপলোড ব্যর্থ: " + err.message);
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  // ৪-৫ পাতার স্যাম্পল পাতা আপলোড
  const handleSampleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSample(true);
    try {
      const small = await compressImage(file);
      const fd = new FormData();
      fd.set("image", small);
      fd.set("alt", "Sample Page");
      const res = await uploadInline(fd);
      if (res && res.url) {
        setFormData((prev) => ({
          ...prev,
          samplePages: [...(prev.samplePages || []), res.url as string],
        }));
      }
    } catch (err: any) {
      alert("স্যাম্পল পাতা আপলোড ব্যর্থ: " + err.message);
    } finally {
      setUploadingSample(false);
      if (sampleInputRef.current) sampleInputRef.current.value = "";
    }
  };

  const removeSamplePage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      samplePages: prev.samplePages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.coverUrl) {
      alert("বইয়ের নাম এবং কভার ছবি বাধ্যতামূলক।");
      return;
    }

    setSaving(true);
    setMsg(null);

    const res = await saveBookToStore(formData);
    setSaving(false);

    if (res.success) {
      setMsg({ type: "success", text: "বইটি সফলভাবে বইঘরে যুক্ত হয়েছে!" });
      setShowAddForm(false);
      fetchBooks();
    } else {
      setMsg({ type: "error", text: res.error || "সংরক্ষণ ব্যর্থ হয়েছে" });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 font-sans">
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            বইঘর ক্যাটালগ ম্যানেজার
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            নতুন বই যোগ করুন, ডেমো পাতা আপলোড করুন এবং দাম নির্ধারণ করুন
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition"
        >
          {showAddForm ? <X size={15} /> : <Plus size={15} />}
          <span>{showAddForm ? "বাতিল" : "নতুন বই যোগ করুন"}</span>
        </button>
      </div>

      {msg && (
        <div className={`mb-6 p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
          msg.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"
        }`}>
          {msg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* নতুন বই যোগ করার ফর্ম */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-lg space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            নতুন বইয়ের বিস্তারিত তথ্য
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">বইয়ের পুরো নাম *</label>
              <input
                type="text"
                required
                placeholder="যেমন: এইচএসসি ইংলিশ কমপ্লিটিং স্টোরি সাজেশন"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">লেখক / সংকলক *</label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
              >
                <option value="HSC">এইচএসসি (HSC)</option>
                <option value="SSC">এসএসসি (SSC)</option>
                <option value="NTRCA">NTRCA শিক্ষক নিবন্ধন</option>
                <option value="Job">চাকরি ও বিসিএস</option>
                <option value="Note">হ্যান্ডনোট ও শিট</option>
                <option value="English">ইংলিশ গ্রামার</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">eBook / PDF দাম (৳) *</label>
              <input
                type="number"
                required
                value={formData.pdfPrice}
                onChange={(e) => setFormData({ ...formData, pdfPrice: Number(e.target.value) })}
                className="w-full rounded-xl border border-emerald-300 px-3 py-2 text-xs font-bold text-emerald-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hard Copy / প্রিন্ট দাম (৳)</label>
              <input
                type="number"
                value={formData.printPrice}
                onChange={(e) => setFormData({ ...formData, printPrice: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none"
              />
            </div>
          </div>

          {/* 📸 কভার ছবি আপলোড (ফ্ল্যাট বইয়ের ছবি) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <label className="block text-xs font-bold text-slate-700">বইয়ের ফ্ল্যাট কভার ছবি (মোবাইল গ্যালারি থেকে) *</label>
            <input type="file" ref={coverInputRef} accept="image/*" onChange={handleCoverUpload} className="hidden" />

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={uploadingCover}
                onClick={() => coverInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                {uploadingCover ? <Loader2 size={14} className="animate-spin text-blue-600" /> : <UploadCloud size={14} className="text-blue-600" />}
                <span>{uploadingCover ? "আপলোড হচ্ছে..." : "কভার ছবি বাছুন"}</span>
              </button>

              {formData.coverUrl && (
                <div className="flex items-center gap-2">
                  <div className="relative aspect-[3/4.2] h-12 rounded overflow-hidden border border-slate-300">
                    <Image src={formData.coverUrl} alt="Cover" fill className="object-cover" />
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold">কভার যুক্ত হয়েছে ✓</span>
                </div>
              )}
            </div>
          </div>

          {/* 📖 ৪-৫ পাতার স্যাম্পল পাতা আপলোড ("একটু পড়ে দেখুন" ফিচারের জন্য) */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
            <label className="block text-xs font-bold text-emerald-900">
              &quot;একটু পড়ে দেখুন&quot; এর জন্য ৪-৫ পৃষ্ঠার স্যাম্পল ছবি আপলোড করুন
            </label>
            <input type="file" ref={sampleInputRef} accept="image/*" onChange={handleSampleUpload} className="hidden" />

            <button
              type="button"
              disabled={uploadingSample}
              onClick={() => sampleInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-bold hover:bg-emerald-700 transition"
            >
              {uploadingSample ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              <span>{uploadingSample ? "পাতা আপলোড হচ্ছে..." : "+ স্যাম্পল পাতা যোগ করুন"}</span>
            </button>

            {/* আপলোড করা স্যাম্পল পাতার তালিকা */}
            {formData.samplePages && formData.samplePages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 pt-2">
                {formData.samplePages.map((url, i) => (
                  <div key={i} className="relative aspect-[3/4.2] h-16 rounded-lg overflow-hidden border border-slate-300 bg-white shadow-xs group">
                    <Image src={url} alt={`Page ${i + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeSamplePage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full"
                    >
                      <X size={10} />
                    </button>
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center">
                      পাতা {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* সম্পূর্ণ মূল PDF ড্রাইভ লিংক */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              সম্পূর্ণ বইয়ের মূল PDF ডাউনলোড লিংক (পেমেন্টের পর শিক্ষার্থী পাবে) *
            </label>
            <input
              type="url"
              required
              placeholder="https://drive.google.com/file/d/..."
              value={formData.pdfDriveUrl}
              onChange={(e) => setFormData({ ...formData, pdfDriveUrl: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">বইয়ের সারসংক্ষেপ বিবরণ</label>
            <textarea
              rows={3}
              placeholder="বইটির বিষয়বস্তু সম্পর্কে ২-৩ লাইন লিখুন..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>বইটি সংরক্ষণ করুন</span>
          </button>
        </form>
      )}

      {/* বইয়ের তালিকা */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          বইঘরে এখনো কোনো বই যুক্ত করা হয়নি। &quot;নতুন বই যোগ করুন&quot; বাটনে চাপ দিয়ে প্রথম বইটি যোগ করুন।
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((b) => (
            <div key={b.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 flex gap-3 items-center shadow-xs">
              <div className="relative aspect-[3/4.2] h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                <Image src={b.coverUrl} alt={b.title} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-slate-900 truncate">{b.title}</h3>
                <p className="text-[11px] text-slate-500 truncate">{b.author}</p>
                <div className="mt-1 flex items-center gap-2 text-[11px] font-bold">
                  <span className="text-emerald-700">PDF: ৳{toBn(b.pdfPrice)}</span>
                  {b.printPrice ? <span className="text-blue-700">প্রিন্ট: ৳{toBn(b.printPrice)}</span> : null}
                </div>
                <div className="mt-1 text-[10px] text-slate-400">
                  স্যাম্পল পাতা: {b.samplePages?.length || 0}টি
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
          }
