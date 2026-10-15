import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { db } from "@/lib/db";
import { popularTags } from "@/lib/popular-tags";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Blog",
  description: "পড়াশোনা, ভর্তি পরীক্ষা, NTRCA আর চাকরির প্রস্তুতি নিয়ে লেখা।",
  alternates: { canonical: "/blog" },
};

export default async function Blog() {
  const [posts, tags] = await Promise.all([
    db.post.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 60 }).catch(() => []),
    popularTags(20),
  ]);
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Blog</h1>
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Popular tags">
          {tags.map(([t, n]) => <Link key={t} href={`/tag/${encodeURIComponent(t)}`} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-royal hover:bg-blue-100">#{t} <span className="text-xs text-slate-500">{n}</span></Link>)}
        </div>
      )}
      {posts.length === 0 && <p className="mt-6 text-slate-600">No posts yet.</p>}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug ?? p.id}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
            <div className="relative aspect-video bg-gradient-to-br from-royal to-sky-400">
              {p.coverUrl && <Image src={p.coverUrl} alt={p.coverAlt ?? p.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px" className="object-cover" />}
            </div>
            <div className="p-4">
              <h2 className="font-bold leading-snug">{p.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">{p.metaDescription || p.excerpt || p.body}</p>
              <p className="mt-3 flex items-center gap-1 text-xs text-slate-500"><CalendarDays size={14} />{p.createdAt.toLocaleDateString("en-GB")}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
