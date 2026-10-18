import React from "react";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none group cursor-pointer ${className}`}>
      {/* 🚀 কাস্টম ভেক্টর ব্র্যান্ডমার্ক (Custom Vector Monogram) */}
      <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-md transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* প্রিমিয়াম ব্লু গ্র্যাডিয়েন্ট */}
            <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            {/* ভাইব্রেন্ট সায়ান অ্যাকসেন্ট */}
            <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>

          {/* ব্যাকগ্রাউন্ড স্কয়ার (Smooth Squircle) */}
          <rect width="48" height="48" rx="14" fill="url(#primaryGrad)" />

          {/* গ্র্যাজুয়েশন ক্যাপের উপরের অংশ (Diamond) */}
          <path
            d="M24 11L38 18L24 25L10 18L24 11Z"
            fill="white"
            fillOpacity="0.95"
          />

          {/* 'S' আকৃতির খোলা বই ও সাফল্য নির্দেশক কার্ভ */}
          <path
            d="M15 22.5V29C15 32.5 19 35.5 24 35.5C29 35.5 33 32.5 33 29V22.5L24 27L15 22.5Z"
            fill="url(#cyanGrad)"
          />

          {/* গোল্ডেন ক্যাপ ট্যাসেল (Golden Tassel Accent) */}
          <circle cx="36.5" cy="22" r="2" fill="#FBBF24" />
          <path d="M36.5 22V26" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* ✍️ ব্র্যান্ড নাম ও ব্যাজ */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1 leading-none">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Saiful<span className="text-blue-600">Sir</span>
          </span>
          <span className="rounded-md bg-blue-50 dark:bg-blue-950/80 px-1.5 py-0.5 text-[10px] font-extrabold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            .COM
          </span>
        </div>
        
        <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider mt-1">
          স্মার্ট শিক্ষা প্ল্যাটফর্ম
        </span>
      </div>
    </div>
  );
}
