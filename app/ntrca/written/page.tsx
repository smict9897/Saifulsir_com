import type { Metadata } from "next";
import Link from "next/link";
import { PenSquare, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "NTRCA Written Examination Preparation | SaifulSir.com",
  description: "বেসরকারি শিক্ষক নিবন্ধন লিখিত পরীক্ষা (Written Exam) ১০০ নম্বরের বিষয়ভিত্তিক প্রস্তুতি ও সাজেশন।",
};

export default function NTRCAWrittenPage() {
  return (
    <main className="min-h-screen bg-white text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/ntrca" className="hover:underline">NTRCA</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">Written Exam</span>
        </nav>

        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <PenSquare className="text-violet-600" size={32} />
            NTRCA লিখিত পরীক্ষা (Written Exam)
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            নিজ নিজ পদের ১০০ নম্বরের বিষয়ভিত্তিক লিখিত পরীক্ষার সাজেস্টেড প্রশ্ন ও উত্তরপত্র লেখার নিয়মাবলী।
          </p>
        </div>

        <section className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <h2 className="text-xl font-bold text-slate-900">বিষয়ভিত্তিক লিখিত সাজেশন</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            কম্পিউটার শিক্ষা, আইসিটি, বাংলা, ইংরেজি, গণিতসহ বিভিন্ন বিষয়ের লিখিত পরীক্ষার স্পেশাল শিট পেতে যুক্ত থাকুন।
          </p>
          <div className="pt-2">
            <Link 
              href="/ntrca" 
              className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700 transition"
            >
              <span>সকল NTRCA রিসোর্স দেখুন</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}

