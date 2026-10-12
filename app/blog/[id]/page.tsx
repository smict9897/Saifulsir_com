import { notFound } from "next/navigation";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Post({ params }: { params: Promise<{ id: string }> }) {
  const p = await db.post.findUnique({ where: { id: (await params).id } });
  if (!p) notFound();
  return (<main className="mx-auto max-w-2xl px-4 py-10"><h1 className="text-3xl font-bold">{p.title}</h1>
    <p className="mt-1 text-sm text-slate-600">{p.createdAt.toLocaleDateString("en-GB")}</p>
    <div className="mt-6 grid gap-4 leading-relaxed">{p.body.split(/\n{2,}/).map((t, i) => <p key={i}>{t}</p>)}</div></main>);
}
