"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { FileUp } from "lucide-react";
import curriculum from "../nctb-curriculum.json";

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "SSC", "HSC", "Admission", "Job"];
const MAX = 4_000_000;
const OTHER = "__other__";
const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700";

const CLASS_MAP: Record<string, string> = {
  "6": "Class 6",
  "7": "Class 7",
  "8": "Class 8",
  "SSC": "Class 9-10",
  "HSC": "Class 11-12",
};

function getCurriculumSubjects(cat: string): string[] {
  const key = CLASS_MAP[cat];
  if (!key) return [];
  const cls = curriculum.classes.find((c) => c.class === key);
  return cls ? cls.subjects.map((s) => s.name) : [];
}

function getCurriculumChapters(cat: string, subject: string): string[] {
  const key = CLASS_MAP[cat];
  if (!key) return [];
  const cls = curriculum.classes.find((c) => c.class === key);
  if (!cls) return [];
  const sub = cls.subjects.find((s) => s.name === subject);
  return sub ? sub.chapters : [];
}

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
  const [category, setCategory] = useState("SSC");
  const [subjSel, setSubjSel] = useState("");
  const [subjOther, setSubjOther] = useState("");
  const [topSel, setTopSel] = useState("");
  const [topOther, setTopOther] = useState("");

  const subjects = useMemo(() => getCurriculumSubjects(category), [category]);
  const subjIsOther = subjSel === OTHER || subjects.length === 0;
  const subject = subjIsOther ? subjOther.trim() : subjSel;

  const chapters = useMemo(() => getCurriculumChapters(category, subjSel), [category, subjSel]);
  const topIsOther = topSel === OTHER || (subject !== "" && chapters.length === 0);
  const topic = topIsOther ? topOther.trim() : topSel;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const f = fd.get("file");
    if (!(f instanceof File) || !f.size) {
      setMsg({ ok: false, text: "একটি ফাইল বেছে নিন।" });
      return;
    }
    if (!subject) {
      setMsg({ ok: false, text: "বিষয় দিন।" });
      return;
    }
    setBusy(true);
    try {
      const blob = await shrink(f);
      if (blob.size > MAX) {
        setMsg({ ok: false, text: "ফাইল ৪ MB এর বেশি। পেজ কমিয়ে বা ছোট করে দিন।" });
        return;
      }
      fd.set("file", blob, blob === f ? f.name : "scan.jpg");
      fd.set("approve", form.approve.checked ? "1" : "0");
      fd.set("category", category);
      fd.set("subject", subject);
      fd.set("topic", topic || "");
      const res = await fetch("/api/qb/extract", { method: "POST", body: fd });
      const d = await res.json().catch(() => null);
      if (d?.ok) {
        setMsg({
          ok: true,
          text: `\( {d.count}টি প্রশ্ন জমা হয়েছে \){d.approved ? "" : " (অনুমোদনের অপেক্ষায়)"}।`,
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
        <select
          name="category"
          className={input}
          required
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubjSel("");
            setSubjOther("");
            setTopSel("");
            setTopOther("");
          }}
        >
          {CLASSES.map((c) => (
  <option key={c} value={c}>
    {c === "SSC" ? "SSC (নবম-দশম)" : c === "HSC" ? "HSC (একাদশ-দ্বাদশ)" : /^\d+$/.test(c) ? `ক্লাস ${c}` : c}
  </option>
))}
        </select>

        {/* Subject */}
        {subjects.length > 0 ? (
          <select
            className={input}
            value={subjSel}
            onChange={(e) => {
              setSubjSel(e.target.value);
              setSubjOther("");
              setTopSel("");
              setTopOther("");
            }}
          >
            <option value="">বিষয় বাছুন</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value={OTHER}>অন্য (নিজে লিখুন)</option>
          </select>
        ) : (
          <input
            name="subject"
            placeholder="বিষয় (যেমন: গণিত)"
            className={input}
            required
            value={subjOther}
            onChange={(e) => setSubjOther(e.target.value)}
          />
        )}

        {subjIsOther && subjects.length > 0 && (
          <input
            className={input + " col-span-2"}
            placeholder="বিষয়ের নাম লিখুন"
            value={subjOther}
            onChange={(e) => setSubjOther(e.target.value)}
          />
        )}

        {/* Chapter / Topic */}
        {chapters.length > 0 ? (
          <select
            className={input}
            value={topSel}
            onChange={(e) => {
              setTopSel(e.target.value);
              setTopOther("");
            }}
          >
            <option value="">অধ্যায় বাছুন</option>
            {chapters.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            <option value={OTHER}>অন্য (নিজে লিখুন)</option>
          </select>
        ) : (
          <input
            name="topic"
            placeholder="অধ্যায়"
            className={input}
            value={topOther}
            onChange={(e) => setTopOther(e.target.value)}
          />
        )}

        {topIsOther && chapters.length > 0 && (
          <input
            className={input}
            placeholder="অধ্যায়ের নাম লিখুন"
            value={topOther}
            onChange={(e) => setTopOther(e.target.value)}
          />
        )}

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

      {/* hidden fields so FormData gets the final values */}
      <input type="hidden" name="subject" value={subject} />
      <input type="hidden" name="topic" value={topic} />

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
        <p
          role="alert"
          className={`rounded-lg p-3 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {msg.text}{" "}
          {msg.ok && (
            <Link href="/admin/questions" className="font-semibold underline">
              প্রশ্ন ব্যাংক দেখুন
            </Link>
          )}
        </p>
      )}
    </form>
  );
}
