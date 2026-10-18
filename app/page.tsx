import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { 
  Atom, Award, Backpack, Book, BookOpen, Calculator, CalendarDays, 
  ClipboardList, Clock, Compass, Crop, FileText, FlaskConical, 
  GraduationCap, Landmark, Library, Lightbulb, Presentation, 
  Rocket, Search, ShieldCheck, Stethoscope, Target, Trophy,
  Users, CheckCircle2, Sparkles, ArrowRight
} from "lucide-react";
import { db } from "@/lib/db";
import { getSite } from "@/lib/site";
import { popularTags } from "@/lib/popular-tags";
import { catPath } from "@/lib/cat-paths";

export const dynamic = "force-dynamic";

type Item = { 
  title: string; 
  subtitle: string; 
  icon: LucideIcon; 
  tint: string; 
  href?: string; 
  slug?: string 
};

const q = (s: string) => `/search?q=${encodeURIComponent(s)}`;

// বাংলা-ফার্স্ট ও পরিচ্ছন্ন ক্যাটাগরি ডেটা
const primary: Item[] = [
  { title: "১ম শ্রেণি", subtitle: "পাঠ্যবই ও সহজ নোট", icon: Book, tint: "bg-emerald-50 text-emerald-600 border-emerald-100", href: q("Class 1"), slug: "class-1" },
  { title: "২য় শ্রেণি", subtitle: "প্রাথমিক পাঠ ও সমাধান", icon: Backpack, tint: "bg-sky-50 text-sky-600 border-sky-100", href: q("Class 2"), slug: "class-2" },
  { title: "৩য় শ্রেণি", subtitle: "বই ও অনুশীলনী নোট", icon: BookOpen, tint: "bg-amber-50 text-amber-600 border-amber-100", href: q("Class 3"), slug: "class-3" },
  { title: "৪র্থ শ্রেণি", subtitle: "সকল বিষয়ের গাইড", icon: Lightbulb, tint: "bg-rose-50 text-rose-600 border-rose-100", href: q("Class 4"), slug: "class-4" },
  { title: "৫ম শ্রেণি", subtitle: "প্রাথমিক সমাপনী নোট", icon: GraduationCap, tint: "bg-violet-50 text-violet-600 border-violet-100", href: q("Class 5"), slug: "class-5" },
  { title: "৫ম শ্রেণি বৃত্তি", subtitle: "বৃত্তি পরীক্ষার প্রস্তুতি", icon: Award, tint: "bg-yellow-50 text-yellow-700 border-yellow-200", href: q("Class 5 বৃত্তি"), slug: "class-5-scholarship" },
];

const secondary: Item[] = [
  { title: "৬ষ্ঠ শ্রেণি", subtitle: "নতুন শিক্ষাক্রমের নোট", icon: GraduationCap, tint: "bg-blue-50 text-blue-600 border-blue-100", href: q("Class 6"), slug: "class-6" },
  { title: "৭ম শ্রেণি", subtitle: "পাঠ্যবই ও সমাধান", icon: Atom, tint: "bg-cyan-50 text-cyan-600 border-cyan-100", href: q("Class 7"), slug: "class-7" },
  { title: "৮ম শ্রেণি", subtitle: "জেএসসি ও জুনিয়র নোট", icon: Compass, tint: "bg-emerald-50 text-emerald-600 border-emerald-100", href: q("Class 8"), slug: "class-8" },
  { title: "৯ম-১০ম শ্রেণি (SSC)", subtitle: "এসএসসি পূর্ণাঙ্গ প্রস্তুতি", icon: FileText, tint: "bg-amber-50 text-amber-600 border-amber-100", href: q("Class 9-10"), slug: "class-9-10" },
  { title: "একাদশ-দ্বাদশ (HSC)", subtitle: "বিজ্ঞান, মানবিক ও বাণিজ্য", icon: FlaskConical, tint: "bg-violet-50 text-violet-600 border-violet-100", href: q("HSC"), slug: "hsc" },
  { title: "৮ম শ্রেণি বৃত্তি", subtitle: "জুনিয়র মেধা বৃত্তি গাইড", icon: Trophy, tint: "bg-indigo-50 text-indigo-600 border-indigo-100", href: q("Class 8 বৃত্তি"), slug: "class-8-scholarship" },
];

const compete: Item[] = [
  { title: "NTRCA শিক্ষক নিবন্ধন", subtitle: "স্কুল, কলেজ ও প্রিলি প্রস্তুতি", icon: Presentation, tint: "bg-emerald-50 text-emerald-600 border-emerald-100", href: "/ntrca" },
  { title: "বিশ্ববিদ্যালয় ভর্তি", subtitle: "ভার্সিটি ও মেডিকেল গাইড", icon: Rocket, tint: "bg-rose-50 text-rose-600 border-rose-100", href: "/admission" },
  { title: "BCS ও জব প্রস্তুতি", subtitle: "বিসিএস প্রিলিমিনারি ও ব্যাংক", icon: ShieldCheck, tint: "bg-amber-50 text-amber-600 border-amber-100", href: q("BCS") },
  { title: "জাতীয় বিশ্ববিদ্যালয়", subtitle: "অনার্স ও ডিগ্রি সাজেশন", icon: Landmark, tint: "bg-indigo-50 text-indigo-600 border-indigo-100", href: q("NU") },
  { title: "মেডিকেল প্রশ্নব্যাংক", subtitle: "ডেন্টাল ও এমবিবিএস ভর্তি", icon: Stethoscope, tint: "bg-red-50 text-red-600 border-red-100", href: q("Medical") },
  { title: "সহায়িকা ই-লাইব্রেরি", subtitle: "বিনামূল্যে গাইড ও শিট", icon: Library, tint: "bg-slate-50 text-slate-600 border-slate-200", href: "/library" },
];

const tools: Item[] = [
  { title: "ছবি ও স্বাক্ষর রিসাইজার", subtitle: "জব ও ভর্তির ফরমের সঠিক মাপ", icon: Crop, tint: "bg-sky-50 text-sky-600 border-sky-100", href: "/tools/photo-resizer" },
  { title: "জাতীয় বিশ্ববিদ্যালয় CGPA", subtitle: "অনার্স রেজাল্ট প্ল্যানার", icon: Calculator, tint: "bg-indigo-50 text-indigo-600 border-indigo-100", href: "/tools/nu-cgpa" },
  { title: "SSC ও HSC GPA ক্যালকুলেটর", subtitle: "৪র্থ বিষয়সহ নির্ভুল পয়েন্ট", icon: Calculator, tint: "bg-emerald-50 text-emerald-600 border-emerald-100", href: "/tools/gpa" },
  { title: "অ্যাসাইনমেন্ট কভার পেজ", subtitle: "প্রিন্টযোগ্য ফ্রন্ট পেজ তৈরি", icon: ClipboardList, tint: "bg-violet-50 text-violet-600 border-violet-100", href: "/tools/cover-page" },
  { title: "ভর্তি যোগ্যতা যাচাই", subtitle: "জিপিএ অনুযায়ী ভার্সিটি তালিকা", icon: Target, tint: "bg-amber-50 text-amber-600 border-amber-100" },
];

const chips = [
  ["HSC সাজেশন", "HSC"],
  ["SSC প্রস্তুতি", "SSC"],
  ["NTRCA প্রশ্নব্যাংক", "NTRCA"],
  ["BCS প্রিলি", "BCS"],
  ["মেডিকেল ভর্তি", "Medical"]
];

// আধুনিক ও ক্লিনার সেকশন হেডার
function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-4 mt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-1 border-b border-slate-200/80 pb-3">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        {desc && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

function Card({ it }: { it: Item }) {
  const Icon = it.icon;
  const isAvailable = Boolean(it.href);

  const content = (
    <div className={`group relative flex items-center gap-3.5 rounded-2xl border bg-white p-3.5 transition-all duration-200 ${
      isAvailable 
        ? "border-slate-200/80 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5" 
        : "border-slate-100 opacity-60 cursor-not-allowed"
    }`}>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${it.tint} transition-transform group-hover:scale-105`}>
        <Icon size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
          {it.title}
        </h3>
        <p className="text-xs text-slate-500 truncate mt-0.5">{it.subtitle}</p>
      </div>
      {!isAvailable && (
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
          শীঘ্রই
        </span>
      )}
    </div>
  );

  return isAvailable ? <Link href={it.href!}>{content}</Link> : content;
}

const Grid = ({ items }: { items: Item[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {items.map((it) => (
      <Card key={it.title} it={it} />
    ))}
  </div>
);

const fmt = (d: Date) => d.toLocaleDateString("bn-BD", { dateStyle: "medium" });

export default async function Home() {
  const [posts, trending, quotes, cats, site, tags] = await Promise.all([
    db.post.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 4 }).catch(() => []),
    db.resource.findMany({ orderBy: [{ downloads: "desc" }, { createdAt: "desc" }], take: 6 }).catch(() => []),
    db.testimonial.findMany({ orderBy: { createdAt: "desc" }, take: 3 }).catch(() => []),
    db.category.findMany({ select: { slug: true } }).catch(() => []),
    getSite(),
    popularTags(8),
  ]);

  const slugSet = new Set(cats.map((c) => c.slug));
  const resolve = (items: Item[]) =>
    items.map((it) => (it.slug && slugSet.has(it.slug) ? { ...it, href: `/category/${it.slug}` } : it));

  return (
    <main className="min-h-screen bg-slate-50/50 pb-16">
      
      {/* 🚀 Hero Section (Clean, Modern, Search-First) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50/50 px-4 pt-12 pb-14 text-center border-b border-slate-200/60">
        <div className="mx-auto max-w-3xl">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-sm">
            <Sparkles size={14} className="text-blue-600 animate-pulse" />
            <span>{site.heroBadge || "বাংলাদেশের স্মার্ট এডুকেশন প্ল্যাটফর্ম"}</span>
          </div>

          {/* Heading */}
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight">
            {site.heroTitle || "পড়াশোনা ও পরীক্ষার প্রস্তুতি হোক আরও সহজ"}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            {site.heroSubtitle || "১ম শ্রেণি থেকে বিসিএস—সকল বিষয়ের পূর্ণাঙ্গ নোট, প্রশ্নব্যাংক ও ফ্রি স্টুডেন্ট টুলস একসাথে।"}
          </p>

          {/* Search Bar */}
          <form action="/search" className="mx-auto mt-6 flex max-w-xl items-center rounded-2xl border border-slate-300 bg-white p-1.5 shadow-md shadow-slate-200/50 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
            <input 
              name="q" 
              placeholder="বিষয়, অধ্যায় বা বইয়ের নাম লিখে খুঁজুন..." 
              aria-label="Search" 
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-800 outline-none" 
            />
            <button className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition">
              <Search size={16} />
              <span>খুঁজুন</span>
            </button>
          </form>

          {/* Quick Filter Chips */}
          <div className="mt-4 flex flex-wrap justify-center items-center gap-1.5">
            <span className="text-xs text-slate-600 font-semibold mr-1">জনপ্রিয়:</span>
            {chips.map(([l, s]) => (
              <Link 
                key={l} 
                href={q(s)} 
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-blue-500 hover:text-blue-600 transition"
              >
                {l}
              </Link>
            ))}
          </div>

          {/* Trust/Social Proof Metric */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1"><CheckCircle2 size={15} className="text-emerald-500" /> সম্পূর্ণ বিনামূল্যে</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={15} className="text-emerald-500" /> অভিজ্ঞ শিক্ষক দ্বারা যাচাইকৃত</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={15} className="text-emerald-500" /> নিয়মিত আপডেটেড</span>
          </div>

        </div>
      </section>

      {/* 📖 Main Learning Sections */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Highlighted Banner: Interactive Quiz */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                <ClipboardList size={30} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">বিনামূল্যে প্রশ্নপত্র তৈরি করুন</h2>
                <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                  যেকোনো শ্রেণির প্রশ্ন নির্বাচন করে মুহূর্তেই প্রিন্ট উপযোগী প্রশ্নপত্র বা কুইজ তৈরি করুন।
                </p>
              </div>
            </div>
            <Link 
              href="/question-builder" 
              className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 transition shadow-sm"
            >
              তৈরি করুন →
            </Link>
          </div>
        </div>

        {/* গ্রিড সেকশনসমূহ */}
        <SectionHeader title="প্রাথমিক স্তর" desc="১ম শ্রেণি থেকে ৫ম শ্রেণির পাঠ্যবই ও নোট" />
        <Grid items={resolve(primary)} />

        <SectionHeader title="মাধ্যমিক ও উচ্চ মাধ্যমিক স্তর" desc="৬ষ্ঠ শ্রেণি থেকে দ্বাদশ শ্রেণির পূর্ণাঙ্গ গাইড" />
        <Grid items={resolve(secondary)} />

        <SectionHeader title="চাকরি ও প্রতিযোগিতামূলক পরীক্ষা" desc="NTRCA, বিসিএস, ভর্তি পরীক্ষা ও সহায়ক বই" />
        <Grid items={compete} />

        <SectionHeader title="প্রয়োজনীয় অনলাইন স্টুডেন্ট টুলস" desc="রেজাল্ট ও চাকরির আবেদনের ফ্রি ক্যালকুলেটর" />
        <Grid items={tools} />

        {/* 📰 Blog & Trending Section */}
        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          
          {/* Latest Posts */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h2 className="text-xl font-bold text-slate-900">সাম্প্রতিক আর্টিকেল ও গাইডলাইন</h2>
              <Link href="/blog" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                সবগুলো দেখুন <ArrowRight size={13} />
              </Link>
            </div>

            {posts.length === 0 ? (
              <p className="text-sm text-slate-500 py-6">শীঘ্রই নতুন লেখা প্রকাশিত হবে।</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {posts.map((p) => {
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
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md hover:border-slate-300"
                    >
                      <div className="relative aspect-video bg-slate-100">
                        <Image 
                          src={imgSrc} 
                          alt={p.coverAlt ?? p.title} 
                          fill 
                          sizes="(max-width: 640px) 100vw, 360px" 
                          className="object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition">
                          {p.title}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">
                          {p.metaDescription || p.excerpt || p.body}
                        </p>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1"><CalendarDays size={13} />{fmt(p.createdAt)}</span>
                          <span className="flex items-center gap-1"><Clock size={13} />{Math.max(1, Math.ceil(p.body.length / 900))} মিনিট পড়া</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Trending Downloads */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-fit">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              সর্বাধিক পঠিত ও ডাউনলোড
            </h2>
            
            {trending.length === 0 ? (
              <p className="mt-4 text-xs text-slate-500">এখনো কোনো তালিকা নেই।</p>
            ) : (
              <ol className="mt-3 divide-y divide-slate-100">
                {trending.map((r, i) => (
                  <li key={r.id} className="py-2.5 first:pt-0 last:pb-0">
                    <Link href={catPath[r.category] ?? "/"} className="flex items-start gap-3 group">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                          {r.category.toUpperCase()}
                        </span>
                        <span className="block text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition truncate mt-0.5">
                          {r.title}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>

        </div>

        {/* 💬 Student Testimonials */}
        {quotes.length > 0 && (
          <section className="mt-14">
            <SectionHeader title="শিক্ষার্থীদের মতামত" desc="আমাদের প্ল্যাটফর্ম সম্পর্কে শিক্ষার্থীরা যা বলছেন" />
            <div className="grid gap-4 md:grid-cols-3">
              {quotes.map((t) => (
                <figure key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <blockquote className="text-sm text-slate-700 leading-relaxed italic">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600 font-semibold">
                    <span>{t.name}</span>
                    {t.role && <span className="text-slate-400 font-normal">({t.role})</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* 🎯 Bottom Feature Cards (Education Focused) */}
        <section className="mt-14 grid gap-4 md:grid-cols-2">
          {/* Card 1: AI Quiz */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-7 text-white shadow-md">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs text-blue-300 mb-2 font-medium">
              <Sparkles size={12} /> স্মার্ট অনুশীলন
            </span>
            <h2 className="text-xl font-bold">AI দিয়ে কুইজ প্র্যাকটিস</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              যেকোনো বিষয়ের টপিক বেছে নিয়ে বাংলা ব্যাখ্যাসহ আনলিমিটেড কুইজ অনুশীলন করুন।
            </p>
            <Link 
              href="/quiz" 
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs sm:text-sm font-semibold transition"
            >
              কুইজ শুরু করুন <ArrowRight size={14} />
            </Link>
          </div>

          
          {/* Card 2: NTRCA & Job Special (Replacing Hire Me) */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-blue-900 p-7 text-white shadow-md">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs text-indigo-300 mb-2 font-medium">
              <GraduationCap size={12} /> স্পেশাল প্রিপারেশন
            </span>
            <h2 className="text-xl font-bold">শিক্ষক নিবন্ধন ও নিয়োগ গাইড</h2>
            <p className="mt-1 text-xs sm:text-sm text-indigo-200">
              বিগত বছরের প্রশ্ন ও সিলেবাসভিত্তিক পূর্ণাঙ্গ প্রস্তুতি শিট সংগ্রহ করুন।
            </p>
            <Link 
              href="/ntrca" 
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 px-4 py-2.5 text-xs sm:text-sm font-semibold transition"
            >
              প্রস্তুতি দেখুন <ArrowRight size={14} />
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
