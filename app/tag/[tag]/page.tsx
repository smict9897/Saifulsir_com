import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { normalizeTag } from "@/lib/tags";
export const dynamic = "force-dynamic";

const dec = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const tag = normalizeTag(dec((await params).tag));
  if (!tag) return { title: "Not found" };
  return { title: `#${tag}`, description: `#${tag} ট্যাগের সব পোস্ট।`, alternates: { canonical: `/tag/${encodeURIComponent(tag)}` } };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const tag = normalizeTag(dec((await params).tag));
  if (!tag) notFound();
  const posts = await db.post.findMany({ where: { published: true, tags: { has: tag } }, orderBy: { createdAt: "desc" }, take: 60 }).catch(() => []);
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-2 text-sm text-slate-500"><Link href="/" className="hover:text-royal">Home</Link> / <Link href="/blog" className="hover:text-royal">Blog</Link></nav>
      <h1 className="text-2xl font-bold">#{tag} <span className="text-base font-normal text-slate-500">({posts.length})</span></h1>
      {posts.length === 0 && <p className="mt-6 text-slate-600">এই ট্যাগে এখনো কোনো পোস্ট নেই।</p>}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug ?? p.id}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
            <div className="relative aspect-video bg-gradient-to-br from-royal to-sky-400">
              {p.coverUrl && <Image src={p.coverUrl} alt={p.coverAlt ?? p.title} fill sizes="(max-width: 640px) 100vw, 340px" className="object-cover" />}
            </div>
            <div className="p-4">
              <h2 className="font-bold leading-snug">{p.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">{p.metaDescription || p.body}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
