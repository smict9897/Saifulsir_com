import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";

const dec = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };
const get = cache((slug: string) => db.category.findUnique({ where: { slug }, include: { parent: true, children: true } }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const c = await get(dec(resolvedParams.slug)).catch(() => null);
  if (!c) return { title: "Not found" };
  return { title: c.name, description: `${c.name} এর সব গাইড, নোট ও সাজেশন।`, alternates: { canonical: `/category/${c.slug}` } };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const c = await get(dec(resolvedParams.slug));
  if (!c) notFound();

  // This category plus every child, grandchild and so on.
  const all = await db.category.findMany({ select: { id: true, parentId: true } });
  const ids = new Set<string>([c.id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const k of all) {
      if (k.parentId && ids.has(k.parentId) && !ids.has(k.id)) { ids.add(k.id); grew = true; }
    }
  }
  const targetCategoryIds = Array.from(ids);

  const posts = await db.post.findMany({
    where: { published: true, categoryId: { in: targetCategoryIds } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-royal">Home</Link>
        {c.parent && <> / <Link href={`/category/${c.parent.slug}`} className="hover:text-royal">{c.parent.name}</Link></>}
      </nav>
      <h1 className="text-2xl font-bold">{c.name} <span className="text-base font-normal text-slate-500">({posts.length})</span></h1>
      {c.children.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {c.children.map((k) => <Link key={k.id} href={`/category/${k.slug}`} className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm hover:border-royal">{k.name}</Link>)}
        </div>
      )}
      {posts.length === 0 && <p className="mt-6 text-slate-600">এখনো কোনো পোস্ট নেই।</p>}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug ?? p.id}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
            <div className="relative aspect-video bg-gradient-to-br from-royal to-sky-400">
              {p.coverUrl && <Image src={p.coverUrl} alt={p.coverAlt ?? p.title} fill sizes="(max-width: 640px) 100vw, 340px" className="object-cover" />}
            </div>
            <div className="p-4">
              <h2 className="font-bold leading-snug">{p.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">{p.metaDescription || p.excerpt || p.body}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
