import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { popularTags } from "@/lib/popular-tags";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "পড়াশোনা, ভর্তি পরীক্ষা, NTRCA আর চাকরির প্রস্তুতি নিয়ে লেখা।",
  alternates: { canonical: "/blog" },
};

const POSTS_PER_PAGE = 12;

export default async function Blog({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  // Next.js 15-এ searchParams একটি Promise, তাই await করতে হবে
  const params = await searchParams;
  const pageStr = params.page || "1";
  const currentPage = parseInt(pageStr, 10);
  
  // ভুল পেজ নাম্বার দিলে ১ ধরে নেবে
  const validPage = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;
  const skip = (validPage - 1) * POSTS_PER_PAGE;

  const [totalPosts, posts, tags] = await Promise.all([
    db.post.count({ where: { published: true } }).catch(() => 0),
    db.post.findMany({ 
      where: { published: true }, 
      orderBy: { createdAt: "desc" }, 
      take: POSTS_PER_PAGE,
      skip: skip
    }).catch(() => []),
    popularTags(20),
  ]);

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // পেজ নম্বর লিস্ট তৈরি
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, validPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Blog</h1>
      
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Popular tags">
          {tags.map(([t, n]) => (
            <Link key={t} href={`/tag/${encodeURIComponent(t)}`} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-royal hover:bg-blue-100">
              #{t} <span className="text-xs text-slate-500">{n}</span>
            </Link>
          ))}
        </div>
      )}
      
      {posts.length === 0 && <p className="mt-6 text-slate-600">No posts found.</p>}
      
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => {
          const imageUrl = p.coverUrl || "/placeholder.jpg";

          return (
            <Link key={p.id} href={`/blog/${p.slug ?? p.id}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="relative aspect-video bg-slate-100">
                <Image 
                  src={imageUrl} 
                  alt={p.coverAlt ?? p.title} 
                  fill 
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px" 
                  className="object-cover" 
                />
              </div>
              <div className="p-4">
                <h2 className="font-bold leading-snug">{p.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{p.metaDescription || p.excerpt || p.body}</p>
                <p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                  <CalendarDays size={14} />{new Date(p.createdAt).toLocaleDateString("en-GB")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 👇 পেজিনেশন সেকশন 👇 */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {/* Prev Button */}
          <Link
            href={`/blog?page=${validPage > 1 ? validPage - 1 : 1}`}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 ${
              validPage === 1 ? "pointer-events-none opacity-40" : ""
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </Link>

          {/* First Page + Dots */}
          {getPageNumbers()[0] > 1 && (
            <>
              <Link href={`/blog?page=1`} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold transition hover:bg-slate-50">
                1
              </Link>
              {getPageNumbers()[0] > 2 && <span className="px-1 text-slate-400">...</span>}
            </>
          )}

          {/* Page Numbers */}
          {getPageNumbers().map((pageNum) => (
            <Link
              key={pageNum}
              href={`/blog?page=${pageNum}`}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition font-semibold ${
                validPage === pageNum
                  ? "border-blue-600 bg-blue-600 text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {pageNum}
            </Link>
          ))}

          {/* Last Page + Dots */}
          {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
            <>
              {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && <span className="px-1 text-slate-400">...</span>}
              <Link href={`/blog?page=${totalPages}`} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold transition hover:bg-slate-50">
                {totalPages}
              </Link>
            </>
          )}

          {/* Next Button */}
          <Link
            href={`/blog?page=${validPage < totalPages ? validPage + 1 : totalPages}`}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 ${
              validPage === totalPages ? "pointer-events-none opacity-40" : ""
            }`}
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </Link>
        </div>
      )}
    </main>
  );
}
