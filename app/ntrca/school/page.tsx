import type { Metadata } from "next";
import Link from "next/link";
import { School, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "NTRCA School Level Preparation | SaifulSir.com",
  description: "বেসরকারি শিক্ষক নিবন্ধন (NTRCA) স্কুল পর্যায়ের সহকারী শিক্ষক পদের প্রস্তুতি ও তথ্য।",
};

export default function NTRCASchoolPage() {
  return (
    <main className="min-h-screen bg-white text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/ntrca" className="hover:underline">NTRCA</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">School Level</span>
        </nav>

        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <School className="text-blue-600" size={32} />
            NTRCA স্কুল পর্যায় (Assistant Teacher)
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            মাধ্যমিক ও নিম্ন-মাধ্যমিক বিদ্যালয়ের সহকারী শিক্ষক পদের প্রিলিমিনারি ও লিখিত পরীক্ষা সংক্রান্ত সকল দিকনির্দেশনা।
          </p>
        </div>

        <section className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <h2 className="text-xl font-bold text-slate-900">স্কুল পর্যায়ের সিলেবাস ও সাধারণ প্রস্তুতি</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            এখানে স্কুল পর্যায়ের বিষয়ভিত্তিক সাজেশন ও প্রিলিমিনারি সিলেবাস নিয়মিত আপডেট করা হবে।
          </p>
          <div className="pt-2">
            <Link 
              href="/ntrca/vacant" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              <span>স্কুল পর্যায়ের শূন্যপদ দেখুন</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}

