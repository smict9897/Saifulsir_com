import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "NTRCA Preliminary Preparation | SaifulSir.com",
  description: "NTRCA প্রিলিমিনারি ১০০ নম্বরের এমসিকিউ (MCQ) পরীক্ষার প্রস্তুতি, বিষয়ভিত্তিক শর্টকাট নোট।",
};

export default function NTRCAPreliPage() {
  return (
    <main className="min-h-screen bg-white text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/ntrca" className="hover:underline">NTRCA</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">Preliminary</span>
        </nav>

        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="text-emerald-600" size={32} />
            NTRCA প্রিলিমিনারি (Preliminary) প্রস্তুতি
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            বাংলা, ইংরেজি, সাধারণ গণিত এবং সাধারণ জ্ঞান—এই ৪টি বিষয়ের ১০০ নম্বরের এমসিকিউ পরীক্ষার প্রস্তুতি গাইড।
          </p>
        </div>

        <section className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <h2 className="text-xl font-bold text-slate-900">এমসিকিউ টেস্ট ও স্টাডি মেটেরিয়াল</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            প্রিলিমিনারি পরীক্ষায় পাসের জন্য অধ্যায়ভিত্তিক প্রশ্ন সমাধান এবং ফ্রি অনলাইন মডেল টেস্ট প্র্যাকটিস করুন।
          </p>
          <div className="pt-2">
            <Link 
              href="/tests" 
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
            >
              <span>অনলাইন মডেল টেস্ট দিন</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}

