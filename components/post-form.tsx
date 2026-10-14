"use client";
import { useActionState, useState } from "react";
import Image from "next/image";
import { savePost, type PostState } from "@/app/actions/posts";
import { parseTags } from "@/lib/tags";

export type PostFormData = {
  id?: string; title: string; slug: string; categoryId: string; tags: string; published: boolean; metaTitle: string; metaDescription: string;
  coverUrl: string | null; coverAlt: string; downloadUrl: string; body: string;
};
const empty: PostFormData = { title: "", slug: "", categoryId: "", tags: "", published: true, metaTitle: "", metaDescription: "", coverUrl: null, coverAlt: "", downloadUrl: "", body: "" };
const f = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2";
const init: PostState = { msg: "" };

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
  const [v, setV] = useState({ title: post.title, slug: post.slug, tags: post.tags, metaTitle: post.metaTitle, metaDescription: post.metaDescription, body: post.body });
  const on = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });
  const tagList = parseTags(v.tags, v.body);
  return (
    <form action={action} className="grid gap-4">
      <label><L t="Title" n={v.title.length} max={200} /><input name="title" required value={v.title} onChange={on("title")} className={f} /></label>
      <label><L t="URL slug" hint="English letters, numbers, hyphens. Blank = use ID" /><input name="slug" value={v.slug} onChange={on("slug")} pattern="[a-z0-9]+(-[a-z0-9]+)*" className={f} placeholder="class-8-math-guide" /></label>
      <label><L t="Category" />
        <select name="categoryId" defaultValue={post.categoryId} className={f}>
          <option value="">No category</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label><L t="Hashtags" hint="separate with spaces, e.g. #hsc #গণিত #class8" n={tagList.length} max={15} />
        <input name="tags" value={v.tags} onChange={on("tags")} className={f} placeholder="#hsc #গণিত #class8" />
      </label>
      {tagList.length > 0 && (
        <div className="-mt-2 flex flex-wrap gap-1.5" aria-label="Tags that will be saved">
          {tagList.map((t) => <span key={t} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-royal">#{t}</span>)}
        </div>
      )}
      <label><L t="Meta title" hint="shown on Google" n={v.metaTitle.length} max={60} /><input name="metaTitle" maxLength={70} value={v.metaTitle} onChange={on("metaTitle")} className={f} /></label>
      <label><L t="Meta description" hint="shown under the title on Google" n={v.metaDescription.length} max={160} /><textarea name="metaDescription" maxLength={170} rows={3} value={v.metaDescription} onChange={on("metaDescription")} className={f} /></label>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs text-slate-500">Google preview</p>
        <p className="truncate text-sm text-green-800">saifulsir.com › blog › {v.slug || "..."}</p>
        <p className="truncate text-lg text-blue-700">{v.metaTitle || v.title || "Post title"}</p>
        <p className="line-clamp-2 text-sm text-slate-600">{v.metaDescription || "The meta description appears here."}</p>
      </div>
      {post.coverUrl && (
        <div>
          <L t="Current cover image" />
          <Image src={post.coverUrl} alt={post.coverAlt || post.title} width={400} height={210} className="h-auto w-full max-w-sm rounded-xl" />
          <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="removeCover" />Remove this cover image</label>
        </div>
      )}
      <label><L t={post.coverUrl ? "Replace cover image" : "Cover image"} hint="JPG, PNG or WebP, up to 3 MB" /><input name="cover" type="file" accept="image/jpeg,image/png,image/webp" className={f} /></label>
      <label><L t="Cover image alt text" hint="required with a cover image" /><input name="coverAlt" maxLength={200} defaultValue={post.coverAlt} className={f} /></label>
      <label><L t="Download link" hint="Google Drive or PDF link, optional" /><input name="downloadUrl" type="url" defaultValue={post.downloadUrl} className={f} placeholder="https://" /></label>
      <label><L t="Post text" hint="blank line between paragraphs. ## Heading. #hashtags in the text become links and tags" />
        <textarea name="body" required minLength={20} rows={16} value={v.body} onChange={on("body")} className={f} />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="published" defaultChecked={post.published} />Publish now (untick to save as a draft)</label>
      {state.msg && <p role="alert" className="text-sm text-red-600">{state.msg}</p>}
      <button disabled={pending} className="rounded-xl bg-royal px-4 py-2.5 font-semibold text-white disabled:opacity-60">
        {pending ? "Saving…" : post.id ? "Save changes" : "Save post"}
      </button>
    </form>
  );
}
