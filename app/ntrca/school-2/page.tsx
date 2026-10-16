import type { Metadata } from "next";
import Link from "next/link";
import { School, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "NTRCA School Level-2 Preparation | SaifulSir.com",
  description: "বেসরকারি শিক্ষক নিবন্ধন (NTRCA) স্কুল পর্যায়-২ (ইবতেদায়ী প্রধান, জুনিয়র শিক্ষক, জুনিয়র মৌলভি) পদের প্রস্তুতি ও দিকনির্দেশনা।",
};

export default function NTRCASchool2Page() {
  return (
    <main className="min-h-screen bg-white text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/ntrca" className="hover:underline">NTRCA</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">School Level-2</span>
        </nav>

        {/* Header Title */}
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <School className="text-indigo-600" size={32} />
            NTRCA স্কুল পর্যায়-২ (School Level-2)
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            ইবতেদায়ী প্রধান, জুনিয়র শিক্ষক, জুনিয়র মৌলভি ও ট্রেড ইন্সট্রাক্টর পদের প্রিলিমিনারি ও লিখিত পরীক্ষার সিলেবাস ও প্রস্তুতি।
          </p>
        </div>

        {/* Key Information Box */}
        <section className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={20} />
            স্কুল পর্যায়-২ পদের বিবরণ ও পরীক্ষা পদ্ধতি
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            এনটিআরসিএ স্কুল পর্যায়-২ মূলত মাধ্যমিক বিদ্যালয়ের জুনিয়র শিক্ষক, কারিগরি শিক্ষা প্রতিষ্ঠানের ট্রেড ইন্সট্রাক্টর এবং মাদ্রাসা শিক্ষাব্যবস্থার ইবতেদায়ী পর্যায়ের পদসমূহের জন্য নির্ধারিত।
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-2 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>প্রিলিমিনারি:</strong> ১০০ নম্বরের এমসিকিউ (বাংলা, ইংরেজি, গণিত, সাধারণ জ্ঞান)</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>লিখিত পরীক্ষা:</strong> নিজ পদের ওপর ১০০ নম্বরের বিষয়ভিত্তিক পরীক্ষা</span>
            </div>
          </div>

          <div className="pt-3">
            <Link 
              href="/ntrca/vacant" 
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
            >
              <span>স্কুল পর্যায়-২ এর শূন্যপদ অনুসন্ধান করুন</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
