"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  getPromoSettings, 
  savePromoSettings, 
  PromoSettings, 
  defaultPromo 
} from "@/app/actions/promo";
import { uploadInline } from "@/app/actions/posts";
import { 
  Save, 
  BookOpen, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  DollarSign, 
  PhoneCall, 
  Eye,
  UploadCloud,
  ImageIcon,
  X
} from "lucide-react";

// ржорзЛржмрж╛ржЗрж▓рзЗрж░ ржмрзЬ ржЫржмрж┐ рж╕рзНржмрзЯржВржХрзНрж░рж┐рзЯржнрж╛ржмрзЗ ржХржорзНржкрзНрж░рзЗрж╕ ржХрж░рж╛рж░ рж╣рзЗрж▓рзНржкрж╛рж░
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

export default function AdminPromoPage() {
  const [settings, setSettings] = useState<PromoSettings>(defaultPromo);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    getPromoSettings()
      .then((data) => {
        if (mounted) setSettings(data || defaultPromo);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (key: keyof PromoSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // ЁЯУ▒ ржорзЛржмрж╛ржЗрж▓ ржЧрзНржпрж╛рж▓рж╛рж░рж┐ ржерзЗржХрзЗ ржЫржмрж┐ ржЖржкрж▓рзЛржб рж╣рзНржпрж╛ржирзНржбрж▓рж╛рж░
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setMsg(null);

    try {
      const smallFile = await compressImage(file);
      const fd = new FormData();
      fd.set("image", smallFile);
      fd.set("alt", "Book Cover Image");

      const res = await uploadInline(fd);
      if (res.url) {
        handleChange("coverUrl", res.url);
        setMsg({ type: "success", text: "ржХржнрж╛рж░ ржЫржмрж┐ рж╕ржлрж▓ржнрж╛ржмрзЗ ржЖржкрж▓рзЛржб рж╣рзЯрзЗржЫрзЗ!" });
      } else {
        setMsg({ type: "error", text: res.error || "ржЫржмрж┐ ржЖржкрж▓рзЛржб ржмрзНржпрж░рзНрже рж╣рзЯрзЗржЫрзЗред" });
      }
    } catch (err: any) {
      setMsg({ type: "error", text: "ржЫржмрж┐ ржЖржкрж▓рзЛржб рждрзНрж░рзБржЯрж┐: " + err.message });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ЁЯОп рж╕рзЗржЯрж┐ржВрж╕ рж╕рж╛ржмржорж┐ржЯ рж╣рзНржпрж╛ржирзНржбрж▓рж╛рж░ (try...finally ржжрж┐рзЯрзЗ ржлрж┐ржХрзНрж╕ржб ржпрж╛рждрзЗ ржмрж╛ржЯржи ржХржЦржирзЛ ржирж╛ ржЖржЯржХрзЗ)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await savePromoSettings(settings);
      if (res.success) {
        setMsg({ type: "success", text: "рж╕ржлрж▓ржнрж╛ржмрзЗ рж╕рзЗржЯрж┐ржВрж╕ рж╕рзЗржн рж╣рзЯрзЗржЫрзЗ! рж╣рзЛржоржкрзЗржЬрзЗ ржЖржкржбрзЗржЯ ржжрзЗржЦрждрзЗ ржкрж╛ржмрзЗржиред" });
      } else {
        setMsg({ type: "error", text: res.error || "рж╕рзЗржн ржмрзНржпрж░рзНрже рж╣рзЯрзЗржЫрзЗред" });
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "рж╕рж╛рж░рзНржнрж╛рж░ ржПрж░рж░ рж╣рзЯрзЗржЫрзЗред ржЖржмрж╛рж░ ржЪрзЗрж╖рзНржЯрж╛ ржХрж░рзБржиред" });
    } finally {
      setSaving(false); // ржмрж╛ржЯржи ржШрзЛрж░рж╛ ржЧрзНржпрж╛рж░рж╛ржирзНржЯрж┐ржб ржмржирзНржз рж╣ржмрзЗ
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
    <div className="mx-auto max-w-4xl px-4 py-8 font-sans">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            ржмржЗ ржУ PDF ржмрж┐ржХрзНрж░рзЯ ржХржирзНржЯрзНрж░рзЛрж▓ ржкрзНржпрж╛ржирзЗрж▓
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            рж╣рзЛржоржкрзЗржЬрзЗрж░ ржкрзНрж░ржорзЛрж╢ржирж╛рж▓ ржкржк-ржЖржк, ржХржнрж╛рж░ ржЫржмрж┐ ржПржмржВ ржорзВрж▓рзНржп ржирж┐рж░рзНржзрж╛рж░ржг ржХрж░рзБржи
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <Eye size={15} /> рж╣рзЛржоржкрзЗржЬрзЗ ржжрзЗржЦрзБржи
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
        
        {/* рзз. ржкржк-ржЖржк ржЕржи/ржЕржл рж╕рзБржЗржЪ */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">рж╣рзЛржоржкрзЗржЬ ржкржк-ржЖржк рж╕ржХрзНрж░рж┐рзЯ рж░рж╛ржЦрзБржи</h3>
            <p className="text-xs text-slate-600 mt-0.5">ржЕржл ржХрж░рзЗ ржжрж┐рж▓рзЗ рж╣рзЛржоржкрзЗржЬрзЗ ржкржк-ржЖржкржЯрж┐ ржЖрж╕ржмрзЗ ржирж╛</p>
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

        {/* рзи. ржмржЗ ржУ ржХржнрж╛рж░ ржЫржмрж┐ ржЖржкрж▓рзЛржб */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" /> ржмржЗ ржУ ржЕржлрж╛рж░рзЗрж░ рждржерзНржп
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ржЕржлрж╛рж░ ржмрзНржпрж╛ржЬ (Badge)</label>
              <input
                type="text"
                value={settings.badge}
                onChange={(e) => handleChange("badge", e.target.value)}
                placeholder="ржпрзЗржоржи: 50% Discount"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-600"
              />
            </div>

            {/* ЁЯУ╕ ржорзЛржмрж╛ржЗрж▓ ржерзЗржХрзЗ ржЫржмрж┐ ржЖржкрж▓рзЛржб ржЕржкрж╢ржи */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ржмржЗржпрж╝рзЗрж░ ржХржнрж╛рж░ ржЫржмрж┐ (ржорзЛржмрж╛ржЗрж▓ ржерзЗржХрзЗ ржЖржкрж▓рзЛржб)</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-800 transition disabled:opacity-50"
                >
                  {uploadingImage ? <Loader2 size={16} className="animate-spin text-blue-600" /> : <UploadCloud size={16} className="text-blue-600" />}
                  <span>{uploadingImage ? "ржЫржмрж┐ ржЖржкрж▓рзЛржб рж╣ржЪрзНржЫрзЗ..." : "ржЧрзНржпрж╛рж▓рж╛рж░рж┐ ржерзЗржХрзЗ ржЫржмрж┐ ржмрж╛ржЫрзБржи"}</span>
                </button>
                     {settings.coverUrl && (
                  <button
                    type="button"
                    onClick={() => handleChange("coverUrl", "")}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                    title="ржЫржмрж┐ рж░рж┐ржорзБржн ржХрж░рзБржи"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* ржЫржмрж┐рж░ ржкрзНрж░рж┐ржнрж┐ржЙ */}
              {settings.coverUrl && (
                <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 w-fit">
                  <div className="relative h-12 w-10 rounded overflow-hidden bg-white border border-slate-200">
                    <Image src={settings.coverUrl} alt="Cover Preview" fill unoptimized className="object-cover" />
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono truncate max-w-[180px]">ржЫржмрж┐ рж╕рж┐рж▓рзЗржХрзНржЯрзЗржб тЬУ</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ржмржЗ ржмрж╛ ржЕржлрж╛рж░рзЗрж░ ржкрзНрж░ржзрж╛ржи рж╢рж┐рж░рзЛржирж╛ржо</label>
            <input
              type="text"
              required
              value={settings.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Writing part"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ржЙржк-рж╢рж┐рж░рзЛржирж╛ржо (Subtitle)</label>
            <input
              type="text"
              value={settings.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
              placeholder="Paragraph writing"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">рж╕ржВржХрзНрж╖рж┐ржкрзНржд ржмрж┐ржмрж░ржг (Description)</label>
            <textarea
              rows={3}
              value={settings.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Full hand Note"
              className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* рзй. ржкрзНрж░рж╛ржЗрж╕рж┐ржВ ржУ ржбрзНрж░рж╛ржЗржн рж▓рж┐ржВржХ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-600" /> ржорзВрж▓рзНржп ржирж┐рж░рзНржзрж╛рж░ржг (PDF ржУ ржкрзНрж░рж┐ржирзНржЯ рж╢рж┐ржЯ)
          </h2>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                ЁЯУ▒ ржбрж┐ржЬрж┐ржЯрж╛рж▓ PDF ржЗ-ржмрзБржХ (ржЗржирж╕рзНржЯрзНржпрж╛ржирзНржЯ ржбрзЗрж▓рж┐ржнрж╛рж░рж┐)
              </span>
              <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                ржкрзНрж░ржзрж╛ржи ржлрзЛржХрж╛рж╕
              </span>
            </div>

            <div className="grid gap-3 grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">PDF ржЕржлрж╛рж░ ржорзВрж▓рзНржп (рз│)</label>
                <input
                  type="number"
                  required
                  value={settings.pdfPrice}
                  onChange={(e) => handleChange("pdfPrice", Number(e.target.value))}
                  className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-emerald-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ржЖржЧрзЗрж░ рж░рзЗржЧрзБрж▓рж╛рж░ ржорзВрж▓рзНржп (рз│)</label>
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
                Google Drive / PDF ржбрж╛ржЙржирж▓рзЛржб рж▓рж┐ржВржХ (ржкрзЗржорзЗржирзНржЯрзЗрж░ ржкрж░ ржЫрж╛рждрзНрж░ ржкрж╛ржмрзЗ)
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

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                ЁЯУж ржкрзНрж░рж┐ржирзНржЯрзЗржб рж╣рзНржпрж╛ржирзНржбржирзЛржЯ рж╢рж┐ржЯ (ржХрзБрж░рж┐рзЯрж╛рж░ ржХржкрж┐)
              </span>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowPrint}
                  onChange={(e) => handleChange("allowPrint", e.target.checked)}
                  className="rounded text-blue-600"
                />
                ржкрзНрж░рж┐ржирзНржЯ ржЕрж░рзНржбрж╛рж░ ржЪрж╛рж▓рзБ рж░рж╛ржЦрзБржи
              </label>
            </div>

            {settings.allowPrint && (
              <div className="grid gap-3 grid-cols-2 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ржкрзНрж░рж┐ржирзНржЯ ржЕржлрж╛рж░ ржорзВрж▓рзНржп (рз│)</label>
                  <input
                    type="number"
                    value={settings.printPrice}
                    onChange={(e) => handleChange("printPrice", Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">рж░рзЗржЧрзБрж▓рж╛рж░ ржорзВрж▓рзНржп (рз│)</label>
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

        {/* рзк. ржкрзЗржорзЗржирзНржЯ ржиржорзНржмрж░ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <PhoneCall size={18} className="text-pink-600" /> ржкрзЗржорзЗржирзНржЯ ржиржорзНржмрж░ (ржпрзЗржЦрж╛ржирзЗ ржЫрж╛рждрзНрж░ ржЯрж╛ржХрж╛ ржкрж╛ржарж╛ржмрзЗ)
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ржмрж┐ржХрж╛рж╢ / ржиржЧржж / рж░ржХрзЗржЯ рж╕рзЗржирзНржб ржорж╛ржирж┐ ржиржорзНржмрж░</label>
            <input
              type="text"
              value={settings.bkashNumber}
              onChange={(e) => {
                const val = e.target.value;
                handleChange("bkashNumber", val);
                handleChange("nagadNumber", val);
              }}
              placeholder="01773729897"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-pink-600 font-mono"
            />
          </div>
        </div>

        {/* рж╕рзЗржн ржмрж╛ржЯржи */}
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{saving ? "рж╕рзЗржЯрж┐ржВрж╕ рж╕рзЗржн рж╣ржЪрзНржЫрзЗ..." : "рж╕рзЗржЯрж┐ржВрж╕ рж╕рзЗржн ржУ рж▓рж╛ржЗржн ржЖржкржбрзЗржЯ ржХрж░рзБржи"}</span>
        </button>
      </form>
    </div>
  );
      }
