import type { Metadata } from "next";
import Link from "next/link";
import type { Category, Post, Resource } from "@prisma/client";
import { Search as SearchIcon } from "lucide-react";
import { db } from "@/lib/db";
import { catPath } from "@/lib/cat-paths";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search", robots: { index: false } };

type PostRow = Post & { category: Category | null };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);
  let res: Resource[] = [], posts: PostRow[] = [], cats: Category[] = [];
  if (q) {
    const has = { contains: q, mode: "insensitive" as const };
    try {
      [res, posts, cats] = await Promise.all([
        db.resource.findMany({ where: { title: has }, orderBy: { createdAt: "desc" }, take: 30 }),
        db.post.findMany({
          where: { published: true, OR: [{ title: has }, { body: has }, { metaTitle: has }, { metaDescription: has }, { category: { OR: [{ name: has }, { slug: has }] } }] },
          include: { category: true }, orderBy: { createdAt: "desc" }, take: 30,
        }),
        db.category.findMany({ where: { OR: [{ name: has }, { slug: has }] }, take: 10 }),
      ]);
    } catch {}
  }
  const none = res.length + posts.length + cats.length === 0;
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <form action="/search" className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="বই বা বিষয়ের নাম লিখুন..." aria-label="Search" className="min-w-0 flex-1 rounded-full border border-slate-300 bg-white px-5 py-3" />
        <button className="flex items-center gap-2 rounded-full bg-royal px-5 py-3 font-semibold text-white"><SearchIcon size={18} />খুঁজুন</button>
      </form>
      {q && none && <p className="mt-8 text-slate-600">&quot;{q}&quot; এর জন্য কিছু পাওয়া যায়নি।</p>}
      <ul className="mt-6 grid gap-3">
        {cats.map((c) => (
          <li key={c.id}>
            <Link href={`/category/${c.slug}`} className="flex items-center justify-between gap-3 rounded-2xl border border-royal/40 bg-blue-50 p-4 hover:border-royal">
              <span className="font-semibold">{c.name}</span><span className="shrink-0 text-sm text-royal">ক্যাটাগরি দেখুন</span>
            </Link>
          </li>
        ))}
        {res.map((r) => (
          <li key={r.id}>
            <Link href={catPath[r.category] ?? "/"} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:border-royal">
              <span className="font-semibold">{r.title}</span>
              <span className="shrink-0 text-sm text-slate-500">{r.category} · {r.priceBdt > 0 ? `৳${r.priceBdt}` : "Free"}</span>
            </Link>
          </li>
        ))}
        {posts.map((p) => (
          <li key={p.id}>
            <Link href={`/blog/${p.slug ?? p.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-royal">
              <span className="text-sm text-royal">{p.category?.name ?? "ব্লগ"}</span><p className="font-semibold">{p.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
