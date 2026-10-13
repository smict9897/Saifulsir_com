import Link from "next/link";
import { db } from "@/lib/db";
import { CalendarDays, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

const fmt = (d: Date) => d.toLocaleDateString("en-GB", { dateStyle: "medium" });

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const posts = query
    ? await db.post.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { body: { contains: query, mode: "insensitive" } },
            { metaDescription: { contains: query, mode: "insensitive" } },
            { category: { name: { contains: query, mode: "insensitive" } } },
            { category: { slug: { contains: query, mode: "insensitive" } } },
          ],
        },
        orderBy: { createdAt: "desc" },
      }).catch(() => [])
    : [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">
        অনুসন্ধান ফলাফল: <span className="text-royal">"{query}"</span>
      </h1>

      {posts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          <p className="text-lg font-bold">পাওয়া যায়নি!</p>
          <p className="mt-1 text-sm text-slate-500">
            এই ক্যাটাগরি বা কিওয়ার্ড সম্পর্কিত কোনো পোস্ট এখনো যুক্ত করা হয়নি।
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl bg-royal px-5 py-2 font-semibold text-white"
          >
            হোমপেজে ফিরে যান
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug ?? p.id}`}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-video bg-gradient-to-br from-royal to-sky-400">
                {p.coverUrl && (
                  <img
                    src={p.coverUrl}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                )}
                <span className="absolute left-3 top-3 rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-white">
                  BLOG
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-bold leading-snug">{p.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                  {p.metaDescription || p.body}
                </p>
                <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={14} />
                    {fmt(p.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {Math.max(1, Math.ceil(p.body.length / 900))} min read
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
