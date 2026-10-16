import type { Metadata } from "next";
import Link from "next/link";
import { 
  BookOpen, GraduationCap, PenSquare, Search, 
  FileText, Award, ArrowRight, CheckCircle2, HelpCircle 
} from "lucide-react";
import ResourceList from "@/components/resource-list"; // আপনার আগের রিসোর্স কম্পোনেন্ট

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NTRCA Preparation & Vacancy Portal | SaifulSir.com",
  description: "বেসরকারি শিক্ষক নিবন্ধন (NTRCA) প্রিলিমিনারি, লিখিত পরীক্ষা প্রস্তুতি, সাজেশন ও শূন্যপদের তালিকা অনুসন্ধান।",
};

export default function NTRCAPage() {
  return (
    <main className="min-h-screen bg-white text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">NTRCA</span>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
              <GraduationCap size={14} />
              <span>Teacher Registration Portal</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              NTRCA শিক্ষক নিবন্ধন প্রস্তুতি
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              বেসরকারি শিক্ষক নিবন্ধন (NTRCA) পরীক্ষার নির্ভুল মডেল টেস্ট, সিলেবাস, বিগত বছরের প্রশ্ন সমাধান, লিখিত সাজেশন এবং গণবিজ্ঞপ্তির শূন্যপদ অনুসন্ধানের নির্ভরযোগ্য প্ল্যাটফর্ম।
            </p>
          </div>
        </div>

        {/* Sub-sections Quick Grid Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/ntrca/vacant" 
            className="p-5 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition space-y-2 group"
          >
            <div className="p-3 bg-blue-600 text-white rounded-xl w-fit group-hover:scale-105 transition">
              <Search size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">শূন্যপদের তালিকা</h3>
            <p className="text-xs text-slate-600">গণবিজ্ঞপ্তির জেলা ও উপজেলাভিত্তিক পোস্ট সার্চ</p>
          </Link>

          <Link 
            href="/ntrca/preli" 
            className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition space-y-2 group"
          >
            <div className="p-3 bg-emerald-600 text-white rounded-xl w-fit group-hover:scale-105 transition">
              <BookOpen size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">প্রিলিমিনারি প্রস্তুতি</h3>
            <p className="text-xs text-slate-600">বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান নোট</p>
          </Link>

          <Link 
            href="/ntrca/written" 
            className="p-5 rounded-2xl border border-violet-200 bg-violet-50/50 hover:bg-violet-100/60 transition space-y-2 group"
          >
            <div className="p-3 bg-violet-600 text-white rounded-xl w-fit group-hover:scale-105 transition">
              <PenSquare size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">লিখিত পরীক্ষা (Written)</h3>
            <p className="text-xs text-slate-600">বিষয়ভিত্তিক লিখিত পরীক্ষার স্পেশাল সাজেশন</p>
          </Link>

          <Link 
            href="/tests" 
            className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 transition space-y-2 group"
          >
            <div className="p-3 bg-amber-600 text-white rounded-xl w-fit group-hover:scale-105 transition">
              <Award size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">অনলাইন মডেল টেস্ট</h3>
            <p className="text-xs text-slate-600">টাইমারসহ NTRCA স্পেশাল কুইজ প্র্যাকটিস</p>
          </Link>
        </div>

        {/* Existing Resource List Section */}
        <section className="space-y-4 pt-4">
          <div className="border-l-4 border-blue-600 pl-3">
            <h2 className="text-2xl font-bold text-slate-900">
              NTRCA সাম্প্রতিক নোট ও রিসোর্সসমূহ
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              নিচে এনটিআরসিএ পরীক্ষার জন্য সাম্প্রতিক আপডেটকৃত সকল স্টাডি মেটেরিয়াল
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6">
            <ResourceList category="ntrca" />
          </div>
        </section>

      </div>
    </main>
  );
}
