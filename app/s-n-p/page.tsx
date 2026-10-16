import type { Metadata } from "next";
import Link from "next/link";
import { 
  Building2, GraduationCap, MapPin, Phone, Mail, 
  BookOpen, Users, Calendar, Award, CheckCircle2, ArrowRight 
} from "lucide-react";

export const metadata: Metadata = {
  title: "S.N.P High School and College | SaifulSir.com",
  description: "S.N.P High School and College, Nabiganj, Hobiganj - Academic information, history, and educational resources.",
};

export default function SNPPage() {
  return (
    <main className="min-h-screen bg-white text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">S.N.P High School and College</span>
        </nav>

        {/* Hero Banner Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
              <Building2 size={14} />
              <span>Educational Institution</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              S.N.P High School & College
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              এস.এন.পি উচ্চ বিদ্যালয় ও কলেজ, নবীগঞ্জ, হবিগঞ্জ। গুণগত শিক্ষা বিস্তার ও সুনাগরিক গঠনে একটি ঐতিহ্যবাহী শিক্ষাপ্রতিষ্ঠান।
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-2">
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-blue-400 shrink-0" />
                <span>Nabiganj, Hobiganj, Sylhet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap size={16} className="text-emerald-400 shrink-0" />
                <span>School & College Level</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-1">
            <BookOpen className="text-blue-600 mb-1" size={24} />
            <span className="text-xs font-medium text-slate-500">Curriculum</span>
            <span className="text-sm font-bold text-slate-900">National (NCTB)</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-1">
            <Users className="text-emerald-600 mb-1" size={24} />
            <span className="text-xs font-medium text-slate-500">Levels</span>
            <span className="text-sm font-bold text-slate-900">Class 6 to 12</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-1">
            <Award className="text-amber-600 mb-1" size={24} />
            <span className="text-xs font-medium text-slate-500">Board</span>
            <span className="text-sm font-bold text-slate-900">Sylhet Board</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-1">
            <Calendar className="text-violet-600 mb-1" size={24} />
            <span className="text-xs font-medium text-slate-500">Academic Year</span>
            <span className="text-sm font-bold text-slate-900">{new Date().getFullYear()} Active</span>
          </div>
        </div>

        {/* About Institution */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            About S.N.P High School & College
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
            S.N.P High School and College is one of the prominent educational institutions in Nabiganj Upazila under Hobiganj district. The institution is dedicated to creating an environment of modern education, technological advancement, and moral discipline for students from secondary to higher secondary levels.
          </p>
        </section>

        {/* Academic Groups / Facilities */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            Academic Groups & Programs
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                <CheckCircle2 size={18} /> Science Group
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Focused on Physics, Chemistry, Higher Math, Biology, and ICT with hands-on learning guidance.
              </p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="text-lg font-bold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 size={18} /> Humanities Group
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Covering Civics, History, Economics, Islamic Studies, and ICT for comprehensive social learning.
              </p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="text-lg font-bold text-violet-700 flex items-center gap-2">
                <CheckCircle2 size={18} /> Business Studies
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accounting, Finance, Business Organization, and ICT aimed at modern business knowledge.
              </p>
            </div>
          </div>
        </section>

        {/* Study Materials Link CTA for Students */}
        <section className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                S.N.P শিক্ষার্থীদের জন্য বিশেষ নোট ও গাইড
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                আইসিটি (ICT), মাধ্যমিক ও উচ্চ মাধ্যমিকের সকল অধ্যায়ভিত্তিক ক্লাস নোট পেতে একাডেমিতে ভিজিট করুন।
              </p>
            </div>
            <Link 
              href="/academic" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shrink-0"
            >
              <span>একাডেমিক নোট দেখুন</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Location & Contact Info */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            Location & Contact
          </h2>
          <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 space-y-3 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <MapPin className="text-blue-600 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-slate-900">Address:</p>
                <p>S.N.P High School and College, Nabiganj, Hobiganj, Sylhet, Bangladesh.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="text-blue-600 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-slate-900">Support Email:</p>
                <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">
                  support@saifulsir.com
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
