"use client";
import { useState } from "react";
import Link from "next/link";
import { FileUp } from "lucide-react";

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "SSC", "HSC", "Admission", "Job"];
const MAX = 4_000_000;
const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700";

async function shrink(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const b = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.85));
    return b ?? file;
  } catch {
    return file;
  }
}

export default function QbExtract() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const f = fd.get("file");
    if (!(f instanceof File) || !f.size) { setMsg({ ok: false, text: "একটি ফাইল বেছে নিন।" }); return; }
    setBusy(true);
    try {
      const blob = await shrink(f);
      if (blob.size > MAX) { setMsg({ ok: false, text: "ফাইল ৪ MB এর বেশি। পেজ কমিয়ে বা ছোট করে দিন।" }); return; }
      fd.set("file", blob, blob === f ? f.name : "scan.jpg");
      fd.set("approve", form.approve.checked ? "1" : "0");
      const res = await fetch("/api/qb/extract", { method: "POST", body: fd });
      const d = await res.json().catch(() => null);
      if (d?.ok) {
        setMsg({
          ok: true,
          text: `${d.count}টি প্রশ্ন জমা হয়েছে${d.approved ? "" : " (অনুমোদনের অপেক্ষায়)"}।`,
        });
      } else {
        setMsg({ ok: false, text: d?.error ?? "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।" });
      }
    } catch {
      setMsg({ ok: false, text: "নেটওয়ার্কে সমস্যা। আবার চেষ্টা করুন।" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <select name="category" className={input} required>
          {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input name="subject" placeholder="বিষয় (যেমন: গণিত)" className={input} required />
        <input name="topic" placeholder="অধ্যায়" className={input} />
        <input name="source" placeholder="বোর্ড-সাল (যেমন: ঢাকা বোর্ড ২০২৫)" className={input} />
        <select name="difficulty" className={input} defaultValue="MEDIUM">
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select name="lang" className={input}>
          <option value="Bangla">Bangla</option>
          <option value="English">English</option>
        </select>
      </div>

      <input name="file" type="file" accept="application/pdf,image/*" className={input} />
      <p className="text-xs text-slate-500">PDF বা ছবি (সর্বোচ্চ ৪ MB)। ছবি পরিষ্কার ও সোজা হলে ভালো পড়বে।</p>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="approve" /> সরাসরি অনুমোদন দিন (না দিলে আগে দেখে অনুমোদন করবেন)
      </label>

      <button
        disabled={busy}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        <FileUp size={16} /> {busy ? "পড়ছে… ১ মিনিট পর্যন্ত লাগতে পারে" : "প্রশ্ন বের করুন"}
      </button>

      {msg && (
        <p role="alert" className={`rounded-lg p-3 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}{" "}
          {msg.ok && <Link href="/admin/questions" className="font-semibold underline">প্রশ্ন ব্যাংক দেখুন</Link>}
        </p>
      )}
    </form>
  );
}
