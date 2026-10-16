import type { Metadata } from "next";
import Link from "next/link";
import { 
  Building2, Search, GraduationCap, MapPin, 
  FileText, CheckCircle2, ArrowRight, HelpCircle, AlertCircle 
} from "lucide-react";

export const metadata: Metadata = {
  title: "NTRCA Vacant List & Vacancy Search | SaifulSir.com",
  description: "NTRCA শিক্ষক নিবন্ধন গণবিজ্ঞপ্তির শূন্যপদের তালিকা, জেলা ও উপজেলাভিত্তিক শূন্যপদ অনুসন্ধান নির্দেশিকা।",
};

export default function NTRCAVacantPage() {
  return (
    <main className="min-h-screen bg-white text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/ntrca" className="hover:underline">NTRCA</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">Vacant Post Search</span>
        </nav>

        {/* Hero Banner Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
              <Search size={14} />
              <span>NTRCA e-Application & Vacancy Portal</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              NTRCA শূন্যপদের তালিকা ও অনুসন্ধান
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              এনটিআরসিএ (NTRCA) গণবিজ্ঞপ্তির জেলা, উপজেলা, বিষয় এবং প্রতিষ্ঠানভিত্তিক বেসরকারি শিক্ষক নিবন্ধনের সঠিক শূন্যপদের তথ্য এবং আবেদন প্রক্রিয়া।
            </p>
          </div>
        </div>

        {/* Search Helper Card */}
        <section className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                কীভাবে শূন্যপদের তালিকা অনুসন্ধান করবেন?
              </h2>
              <p className="text-xs text-slate-500">
                TeleTalk e-Application পোর্টালে শূন্যপদ ফিল্টার করার ধাপসমূহ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">১</span>
              <h3 className="font-bold text-slate-900 text-sm">পর্যায় নির্বাচন (Level)</h3>
              <p className="text-xs text-slate-600">School, College, Madrasah বা Technical পর্যায় সিলেক্ট করুন।</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">২</span>
              <h3 className="font-bold text-slate-900 text-sm">জেলা ও উপজেলা (District)</h3>
              <p className="text-xs text-slate-600">আপনার কাঙ্ক্ষিত জেলা এবং নির্দিষ্ট উপজেলা বাছাই করুন।</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">৩</span>
              <h3 className="font-bold text-slate-900 text-sm">পদের ধরন (Post)</h3>
              <p className="text-xs text-slate-600">আপনার নিবন্ধনকৃত বিষয় (যেমন: Assistant Teacher ICT) নির্বাচন করুন।</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">৪</span>
              <h3 className="font-bold text-slate-900 text-sm">ফলাফল ও ইনস্টিটিউট</h3>
              <p className="text-xs text-slate-600">ইনস্টিটিউটের নাম, পদের নাম, ধরন (এমপিও/অফ-এমপিও) দেখে নিন।</p>
            </div>
          </div>
        </section>

        {/* Official Portal Quick Link Button */}
        <section className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="text-blue-600" size={24} />
              অফিশিয়াল পোর্টালে সরাসরি শূন্যপদ সার্চ করুন
            </h3>
            <p className="text-sm text-slate-600">
              NTRCA TeleTalk e-Application পোর্টালে গিয়ে সরাসরি জেলাভিত্তিক তালিকা দেখুন।
            </p>
          </div>
          <a
            href="http://ngca.teletalk.com.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition shrink-0 shadow-md"
          >
            <span>e-Application পোর্টালে যান</span>
            <ArrowRight size={16} />
          </a>
        </section>

        {/* Important Tips for Candidates */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            শূন্যপদ পছন্দের ক্ষেত্রে গুরুত্বপূর্ণ পরামর্শ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <CheckCircle2 size={18} className="text-emerald-600" />
                MPO vs Non-MPO পোস্ট যাচাই
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                পছন্দের তালিকা (Choice List) সাজানোর সময় ইনস্টিটিউটের পাশে MPO পদ নাকি Non-MPO পদ লেখা রয়েছে তা ভালোভাবে দেখে নিন।
              </p>
            </div>

            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <CheckCircle2 size={18} className="text-emerald-600" />
                নারী কোটা (Female Quota)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                নারী নিবন্ধিত প্রার্থীদের ক্ষেত্রে যেসব প্রতিষ্ঠানে শুধুমাত্র নারী কোটা সংরক্ষিত, সেগুলো সঠিকভাবে দেখে পছন্দক্রম দিন।
              </p>
            </div>
          </div>
        </section>

        {/* Help & Support */}
        <section className="p-6 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle size={20} className="text-blue-600" />
            যেকোনো সহায়তায়
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            এনটিআরসিএ সম্পর্কিত যেকোনো পরামর্শ, বিষয়ভিত্তিক সাজেশন ও গাইডলাইনের জন্য আমাদের{" "}
            <Link href="/contact" className="text-blue-600 hover:underline font-medium">
              যোগাযোগ পেজ
            </Link>{" "}
            বা টেলিগ্রাম গ্রূপের সাথে যুক্ত থাকুন।
          </p>
        </section>

      </div>
    </main>
  );
}
