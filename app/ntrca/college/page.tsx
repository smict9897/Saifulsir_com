import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Building2, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "NTRCA College Level Preparation & Vacancies | SaifulSir.com",
  description: "বেসরকারি শিক্ষক নিবন্ধন (NTRCA) কলেজ পর্যায়ের প্রভাষক পদের প্রস্তুতি, সিলেবাস ও শূন্যপদের তথ্য।",
};

export default function NTRCACollegePage() {
  return (
    <main className="min-h-screen bg-white text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/ntrca" className="hover:underline">NTRCA</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">College Level</span>
        </nav>

        {/* Page Title */}
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="text-blue-600" size={32} />
            NTRCA কলেজ পর্যায় (Lecturer) প্রস্তুতি
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            বেসরকারি কলেজ ও সমমানের শিক্ষাপ্রতিষ্ঠানের প্রভাষক (Lecturer) পদের প্রিলিমিনারি, লিখিত ও বিষয়ভিত্তিক প্রস্তুতি এবং নির্দেশিকা।
          </p>
        </div>

        {/* Content Section */}
        <section className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <h2 className="text-xl font-bold text-slate-900">কলেজ পর্যায়ের শূন্যপদ ও সিলেবাস</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            কলেজ পর্যায়ে প্রভাষক পদে আবেদন ও পরীক্ষার জন্য বাংলা, ইংরেজি, সাধারণ জ্ঞান এবং সংশ্লিষ্ট বিষয়ভিত্তিক পদের সিলেবাস অত্যন্ত গুরুত্বপূর্ণ। খুব শীঘ্রই এখানে পর্যায়ক্রমে সকল বিষয়ের নোট ও গাইডলাইন যুক্ত করা হবে।
          </p>
          <div className="pt-2">
            <Link 
              href="/ntrca/vacant" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              <span>শূন্যপদের তালিকা দেখুন</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}

