"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug?: string | null;
  coverUrl?: string | null;
  coverAlt?: string | null;
  createdAt: Date;
  body: string;
};

const fmt = (d: Date) => new Date(d).toLocaleDateString("en-GB", { dateStyle: "medium" });

export default function RecentArticles({ posts }: { posts: Post[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 2; // একসাথে সম্পূর্ণ ২টি কার্ড দেখাবে
  const totalPages = Math.ceil(posts.length / perPage);

  if (!posts || posts.length === 0) return null;

  const currentPosts = posts.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="mt-7 text-left">
      {/* হেডার */}
      <div className="flex items-center justify-between pb-2 mb-1 px-1">
        <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          সাম্প্রতিক আর্টিকেল ও গাইডলাইন
        </span>
        <Link href="/blog" className="text-xs font-bold text-royal hover:underline flex items-center gap-0.5">
          সবগুলো <ArrowRight size={13} />
        </Link>
      </div>

      {/* সম্পূর্ণ ২টি কার্ড (মোবাইলেও পাশাপাশি ফিট থাকবে, কোনো কার্ড কাটবে না) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {currentPosts.map((p) => {
          let imgSrc = "/placeholder.jpg";
          if (p.coverUrl) {
            imgSrc = (p.coverUrl.startsWith("/") || p.coverUrl.startsWith("http")) 
              ? p.coverUrl 
              : `/${p.coverUrl}`;
          }

          return (
            <Link 
              key={p.id} 
              href={`/blog/${p.slug ?? p.id}`} 
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-royal hover:shadow-md flex flex-col"
            >
              <div className="relative aspect-[16/10] w-full bg-slate-100">
                <Image 
                  src={imgSrc} 
                  alt={p.coverAlt ?? p.title} 
                  fill 
                  sizes="(max-width: 640px) 50vw, 300px" 
                  className="object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  BLOG
                </span>
              </div>
              
              <div className="p-2 sm:p-3 flex flex-col flex-1 justify-between">
                <h3 className="font-bold text-[11px] sm:text-xs text-slate-800 leading-snug line-clamp-2 group-hover:text-royal transition-colors">
                  {p.title}
                </h3>
                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[9px] text-slate-400">
                  <span className="flex items-center gap-0.5">
                    <CalendarDays size={10} />
                    {fmt(p.createdAt)}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Clock size={10} />
                    {Math.max(1, Math.ceil(p.body.length / 900))}m
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* পেজিনেশন ও নাম্বারিং (১, ২, ৩...) */}
      {totalPages > 1 && (
        <div className="mt-3.5 flex items-center justify-center gap-1.5">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`h-7 min-w-[28px] px-1.5 rounded-lg text-xs font-bold transition ${
                currentPage === num
                  ? "bg-royal text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
