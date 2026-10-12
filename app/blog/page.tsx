import Link from "next/link";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Blog() {
  const posts = await db.post.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);
  return (<main className="mx-auto max-w-3xl px-4 py-10"><h1 className="text-2xl font-bold">Blog</h1>
    {posts.length === 0 && <p className="mt-6 text-slate-600">No posts yet.</p>}
    <ul className="mt-6 grid gap-3">{posts.map((p) => (<li key={p.id}><Link href={`/blog/${p.id}`} className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-royal">
      <p className="font-semibold">{p.title}</p><p className="text-sm text-slate-600">{p.createdAt.toLocaleDateString("en-GB")} · {p.body.slice(0, 120)}…</p></Link></li>))}</ul></main>);
}
