"use client";
import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { savePost, type PostState } from "@/app/actions/posts";
import { parseTags } from "@/lib/tags";
import RichEditor from "@/components/rich-editor";
import SeoPanel from "@/components/seo-panel";
import AdminKeywordTool from "@/components/admin-keyword-tool";
import { Code, Eye, Pencil, Wrench } from "lucide-react";

// HTML ট্যাবে লেখা পোস্ট চেনার জন্য একটি র‍্যাপার ব্যবহার হয়।
// not-prose ক্লাস Tailwind prose এর স্টাইল থেকে পোস্টকে আলাদা রাখে।
const OPEN = '<div class="raw-html not-prose">';
const isRawBody = (b: string) => b.trim().startsWith(OPEN);
const wrapRaw = (h: string) => (isRawBody(h) ? h.trim() : `${OPEN}${h.trim()}</div>`);
const unwrapRaw = (b: string) => {
  const t = b.trim();
  return isRawBody(t) ? t.slice(OPEN.length).replace(/<\/div>\s*$/, "").trim() : b;
};

// মোবাইলের বড় ছবি আপলোডের আগে ফোনেই ছোট করে (সর্বোচ্চ 1600px, WebP)
async function compressImage(file: File, maxSide = 1600, quality = 0.82): Promise<File> {
  try {
    if (!file.type.startsWith("image/")) return file;
    if (file.size <= 600_000 && ["image/jpeg", "image/png", "image/webp"].includes(file.type)) return file;
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

export type PostFormData = {
  id?: string; title: string; slug: string; categoryId: string; tags: string; published: boolean; focusKeyword: string; keywords: string;
  metaTitle: string; metaDescription: string; coverUrl: string | null; coverAlt: string; downloadUrl: string; body: string;
};
const empty: PostFormData = {
  title: "", slug: "", categoryId: "", tags: "", published: true, focusKeyword: "", keywords: "", metaTitle: "", metaDescription: "",
  coverUrl: null, coverAlt: "", downloadUrl: "", body: "",
};
const f = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2";
const init: PostState = { msg: "" };

type Tab = "compose" | "html" | "preview";
const isEscapedTable = (s: string) => /&lt;\s*table\b/i.test(s);
const risky = (s: string) => /<table\b|style=/i.test(s);

// Compose এডিটরে পেস্ট হয়ে &lt;table&gt; হয়ে যাওয়া কোড আবার ঠিক করে
function repairEscapedHtml(s: string): string {
  return s
    .replace(/<\/(div|p)>\s*<(div|p)[^>]*>/gi, "\n")
    .replace(/^\s*<(div|p)[^>]*>/i, "")
    .replace(/<\/(div|p)>\s*$/i, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?a\b[^>]*>/gi, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .trim();
}

function L({ t, hint, n, max }: { t: string; hint?: string; n?: number; max?: number }) {
  return (
    <span className="mb-1 flex items-baseline justify-between gap-2 text-sm font-medium">
      <span>{t}{hint && <span className="ml-2 font-normal text-slate-500">{hint}</span>}</span>
      {max !== undefined && n !== undefined && (
        <span className={`text-xs ${n > max ? "text-red-600" : n >= max * 0.8 ? "text-orange-600" : "text-slate-500"}`}>{n}/{max}</span>
      )}
    </span>
  );
}

export default function PostForm({ post = empty, cats }: { post?: PostFormData; cats: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(savePost.bind(null, post.id ?? null), init);
  const [v, setV] = useState({
    title: post.title, slug: post.slug, tags: post.tags, focusKeyword: post.focusKeyword, keywords: post.keywords,
    metaTitle: post.metaTitle, metaDescription: post.metaDescription,
  });

  const startRaw = isRawBody(post.body) || /<table\b/i.test(post.body) || isEscapedTable(post.body);
  const [html, setHtml] = useState(isRawBody(post.body) ? unwrapRaw(post.body) : post.body);
  const [raw, setRaw] = useState(startRaw); // true হলে কোড হুবহু সেভ হবে (Blogspot HTML ট্যাবের মতো)
  const [tab, setTab] = useState<Tab>(startRaw ? "html" : "compose");
  const [info, setInfo] = useState({ text: "", headings: [] as string[], words: 0 });
  const [coverMsg, setCoverMsg] = useState("");
  const on = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });

  // AI কিওয়ার্ড টুল থেকে কিওয়ার্ড ফর্মে বসায়: ফোকাস খালি থাকলে সেখানে, নইলে Keywords ঘরে যোগ হয়
  const addKeyword = (kw: string, target: "auto" | "focus" | "keywords" = "auto") => {
    setV((p) => {
      const toFocus = target === "focus" || (target === "auto" && !p.focusKeyword.trim());
      if (toFocus) return { ...p, focusKeyword: kw.slice(0, 80) };
      const list = p.keywords.split(",").map((s) => s.trim()).filter(Boolean);
      if (list.some((s) => s.toLowerCase() === kw.toLowerCase())) return p;
      return { ...p, keywords: [...list, kw].slice(0, 10).join(", ") };
    });
  };

  // AI SEO প্যাক থেকে শিরোনাম, slug, meta ও ট্যাগ ফর্মে বসায়
  const applySeo = (p: { title?: string; slug?: string; metaTitle?: string; metaDescription?: string; tags?: string }) => {
    setV((s) => ({
      ...s,
      ...(p.title !== undefined ? { title: p.title.slice(0, 200) } : {}),
      ...(p.slug !== undefined ? { slug: p.slug } : {}),
      ...(p.metaTitle !== undefined ? { metaTitle: p.metaTitle.slice(0, 70) } : {}),
      ...(p.metaDescription !== undefined ? { metaDescription: p.metaDescription.slice(0, 170) } : {}),
      ...(p.tags !== undefined ? { tags: p.tags } : {}),
    }));
  };

  useEffect(() => {
    const doc = new DOMParser().parseFromString(html.replace(/<\/(p|h[1-6]|li|blockquote|div)>/gi, " </$1>"), "text/html");
    const text = (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
    setInfo({ text, headings: Array.from(doc.querySelectorAll("h2,h3,h4")).map((h) => (h.textContent ?? "").trim()), words: text ? text.split(" ").length : 0 });
  }, [html]);

  const goTab = (next: Tab) => {
    if (next === "compose" && raw) {
      if (risky(html) && !confirm("Compose এডিটর টেবিল ও স্টাইল মুছে ফেলতে পারে। তবুও Compose-এ যাবেন?")) return;
      setRaw(false);
    }
    setTab(next);
  };

  // কভার ছবি বাছাই করলেই ফোনে ছোট করে ফর্মে বসিয়ে দেয়
  const onCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) { setCoverMsg(""); return; }
    setCoverMsg("ছবি ছোট করা হচ্ছে…");
    const small = await compressImage(file);
    try {
      const dt = new DataTransfer();
      dt.items.add(small);
      input.files = dt.files;
    } catch {
      // পুরনো ব্রাউজারে অরিজিনাল ছবিই যাবে
    }
    setCoverMsg(small.size > 3_000_000
      ? "ছবিটি এখনও ৩ MB-এর বেশি, ছোট ছবি বাছুন।"
      : `ছবি তৈরি (${Math.round(small.size / 1024)} KB)।`);
  };

  const previewDoc =
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<style>body{margin:0;padding:12px;font-family:system-ui,sans-serif;line-height:1.7;color:#0f172a;background:#fff}</style>` +
    `</head><body>${html}</body></html>`;

  const tabBtn = (t: Tab, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => goTab(t)}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${tab === t ? "bg-royal text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
    >
      {icon}<span>{label}</span>
    </button>
  );

  const tagList = parseTags(v.tags, info.text);
  return (
    <form action={action} className="grid gap-4">
      <label><L t="Title" n={v.title.length} max={200} /><input name="title" required value={v.title} onChange={on("title")} className={f} /></label>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <L t="Post text" hint={`${info.words} শব্দ`} />
        </div>
        <div className="mb-2 flex flex-wrap gap-2">
          {tabBtn("compose", "Compose", <Pencil size={14} />)}
          {tabBtn("html", "HTML", <Code size={14} />)}
          {tabBtn("preview", "Preview", <Eye size={14} />)}
        </div>

        {isEscapedTable(html) && (
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
            <span>এই পোস্টের টেবিল কোড লেখা হিসেবে সেভ হয়ে গেছে। এক ক্লিকে ঠিক করা যাবে।</span>
            <button
              type="button"
              onClick={() => { setHtml(repairEscapedHtml(html)); setRaw(true); setTab("html"); }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 font-semibold text-white hover:bg-amber-700"
            >
              <Wrench size={14} /> টেবিল কোড ঠিক করুন
            </button>
          </div>
        )}

        {/* সার্ভারে সবসময় এই একটি ফিল্ডই যায়। raw হলে কোড হুবহু র‍্যাপারসহ সেভ হয় */}
        <input type="hidden" name="body" value={raw ? wrapRaw(html) : html} />

        {tab === "compose" && <RichEditor name="body_editor" initialHtml={html} onChange={setHtml} />}

        {tab === "html" && (
          <textarea
            value={html}
            onChange={(e) => { setHtml(e.target.value); setRaw(true); }}
            rows={18}
            spellCheck={false}
            placeholder="সরাসরি HTML কোড পেস্ট করুন"
            className="w-full rounded-xl border border-slate-300 bg-slate-900 p-3 font-mono text-xs leading-relaxed text-emerald-400 focus:outline-none sm:text-sm"
          />
        )}

        {tab === "preview" && (
          <iframe
            title="Preview"
            sandbox=""
            srcDoc={previewDoc}
            className="h-[480px] w-full rounded-xl border border-slate-300 bg-white"
          />
        )}

        <p className="mt-1 text-[11px] text-slate-500">
          {tab === "html" ? "HTML ট্যাবের কোড হুবহু সেভ হবে (টেবিল, বর্ডার ও রঙসহ)।" : tab === "preview" ? "এটা সেভ করার আগের প্রিভিউ।" : "সাধারণ লেখার জন্য Compose। টেবিলের কোড HTML ট্যাবে দিন।"}
        </p>
      </div>

      <label><L t="Hashtags" hint="separate with spaces, e.g. #hsc #গণিত #class8" n={tagList.length} max={15} />
        <input name="tags" value={v.tags} onChange={on("tags")} className={f} placeholder="#hsc #গণিত #class8" />
      </label>
      {tagList.length > 0 && (
        <div className="-mt-2 flex flex-wrap gap-1.5" aria-label="Tags that will be saved">
          {tagList.map((t) => <span key={t} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-royal">#{t}</span>)}
        </div>
      )}
      <label><L t="Category" />
        <select name="categoryId" defaultValue={post.categoryId} className={f}>
          <option value="">No category</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      {post.coverUrl && (
        <div>
          <L t="Current cover image" />
          <Image src={post.coverUrl} alt={post.coverAlt || post.title} width={400} height={210} className="h-auto w-full max-w-sm rounded-xl" />
          <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="removeCover" />Remove this cover image</label>
        </div>
      )}
      <label>
        <L t={post.coverUrl ? "Replace cover image" : "Cover image"} hint="মোবাইলের ছবিও চলবে, নিজে ছোট হবে" />
        <input name="cover" type="file" accept="image/*" onChange={onCover} className={f} />
      </label>
      {coverMsg && <p className="-mt-2 text-xs text-slate-500">{coverMsg}</p>}
      <label><L t="Cover image alt text" hint="required with a cover image" /><input name="coverAlt" maxLength={200} defaultValue={post.coverAlt} className={f} /></label>
      <label><L t="Download link" hint="Google Drive or PDF link, optional" /><input name="downloadUrl" type="url" defaultValue={post.downloadUrl} className={f} placeholder="https://" /></label>

      <fieldset className="grid gap-4 rounded-2xl border border-slate-200 p-4">
        <legend className="px-2 text-sm font-semibold">SEO (গুগল সার্চের জন্য)</legend>

        <details className="rounded-xl border border-slate-200 p-3">
          <summary className="cursor-pointer text-sm font-semibold">AI কিওয়ার্ড রিসার্চ (ঐচ্ছিক)</summary>
          <div className="mt-3">
            <AdminKeywordTool compact onSelectKeyword={addKeyword} onApplySeo={applySeo} />
          </div>
        </details>

        <label><L t="Focus keyword" hint="যে শব্দ লিখে সার্চে আসতে চান, একটি" /><input name="focusKeyword" maxLength={80} value={v.focusKeyword} onChange={on("focusKeyword")} className={f} placeholder="যেমন: ৮ম শ্রেণির গণিত সমাধান" /></label>
        <label><L t="Keywords" hint="কমা দিয়ে আলাদা করুন, সর্বোচ্চ ১০টি" /><textarea name="keywords" rows={2} value={v.keywords} onChange={on("keywords")} className={f} placeholder="class 8 math, ৮ম শ্রেণির গণিত, গণিত সমাধান pdf" /></label>
        <label><L t="URL slug" hint="English letters, numbers, hyphens. Blank = use ID" /><input name="slug" value={v.slug} onChange={on("slug")} pattern="[a-z0-9]+(-[a-z0-9]+)*" className={f} placeholder="class-8-math-guide" /></label>
        <label><L t="Meta title" hint="shown on Google" n={v.metaTitle.length} max={60} /><input name="metaTitle" maxLength={70} value={v.metaTitle} onChange={on("metaTitle")} className={f} /></label>
        <label><L t="Meta description" hint="shown under the title on Google" n={v.metaDescription.length} max={160} /><textarea name="metaDescription" maxLength={170} rows={3} value={v.metaDescription} onChange={on("metaDescription")} className={f} /></label>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Google preview</p>
          <p className="truncate text-sm text-green-800">saifulsir.com › blog › {v.slug || "..."}</p>
          <p className="truncate text-lg text-blue-700">{v.metaTitle || v.title || "Post title"}</p>
          <p className="line-clamp-2 text-sm text-slate-600">{v.metaDescription || "The meta description appears here."}</p>
        </div>
        <SeoPanel kw={v.focusKeyword} title={v.title} slug={v.slug} metaTitle={v.metaTitle} metaDescription={v.metaDescription} text={info.text} headings={info.headings} words={info.words} />
      </fieldset>

      <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="published" defaultChecked={post.published} />Publish now (untick to save as a draft)</label>
      {state.msg && <p role="alert" className="text-sm text-red-600">{state.msg}</p>}
      <button disabled={pending} className="rounded-xl bg-royal px-4 py-2.5 font-semibold text-white disabled:opacity-60">
        {pending ? "Saving…" : post.id ? "Save changes" : "Save post"}
      </button>
    </form>
  );
        }
