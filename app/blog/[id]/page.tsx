import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Download } from "lucide-react";
import { db } from "@/lib/db";
import PostBody from "@/components/post-body";
import SaveButton from "@/components/save-button";
export const dynamic = "force-dynamic";

const find = cache((key: string) => db.post.findFirst({ where: { OR: [{ slug: key }, { id: key }] }, include: { category: true } }));
const base = () => (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = await find((await params).id).catch(() => null);
  if (!p) return { title: "Not found" };
  const title = p.metaTitle || p.title;
  const description = p.metaDescription || p.body.replace(/[#!\[\]()]/g, "").replace(/\s+/g, " ").slice(0, 155);
  const path = `/blog/${p.slug ?? p.id}`;
  return {
    title, description, alternates: { canonical: path },
    openGraph: { type: "article", title, description, url: path, publishedTime: p.createdAt.toISOString(),
      ...(p.coverUrl ? { images: [{ url: p.coverUrl, alt: p.coverAlt ?? p.title }] } : {}) },
    twitter: { card: p.coverUrl ? "summary_large_image" : "summary", title, description },
  };
}

export default async function Post({ params }: { params: Promise<{ id: string }> }) {
  const key = (await params).id;
  const p = await find(key);
  if (!p) notFound();
  if (p.slug && key !== p.slug) permanentRedirect(`/blog/${p.slug}`);
  const href = `/blog/${p.slug ?? p.id}`;
  const ld = {
    "@context": "https://schema.org", "@type": "Article", headline: p.metaTitle || p.title,
    datePublished: p.createdAt.toISOString(), author: { "@type": "Person", name: "Saiful Islam" },
    mainEntityOfPage: `${base()}${href}`, ...(p.coverUrl ? { image: [p.coverUrl] } : {}),
  };
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <article>
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-slate-500">
          <Link href="/" className="hover:text-royal">Home</Link>
          {p.category && <> / <Link href={`/category/${p.category.slug}`} className="hover:text-royal">{p.category.name}</Link></>}
        </nav>
        <h1 className="text-3xl font-bold leading-tight">{p.title}</h1>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-600">{p.createdAt.toLocaleDateString("en-GB")}</p>
          <SaveButton label item={{ id: p.id, type: "post", title: p.title, href }} />
        </div>
        {p.coverUrl && (
          <Image src={p.coverUrl} alt={p.coverAlt ?? p.title} width={1200} height={630} priority sizes="(max-width: 768px) 100vw, 672px" className="mt-6 h-auto w-full rounded-2xl" />
        )}
        <PostBody body={p.body} />
        {p.downloadUrl && (
          <a href={p.downloadUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-royal px-5 py-3 font-semibold text-white">
            <Download size={18} />Download
          </a>
        )}
      </article>
    </main>
  );
}
