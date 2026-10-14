import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import PostBody from "@/components/post-body";
export const dynamic = "force-dynamic";

const get = cache((slug: string) => db.page.findUnique({ where: { slug } }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await get((await params).slug).catch(() => null);
  if (!p) return { title: "Not found" };
  return { title: p.title, description: p.body.replace(/[#!\[\]()]/g, "").replace(/\s+/g, " ").slice(0, 155), alternates: { canonical: `/p/${p.slug}` } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const p = await get((await params).slug);
  if (!p) notFound();
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold leading-tight">{p.title}</h1>
      <PostBody body={p.body} />
    </main>
  );
}
