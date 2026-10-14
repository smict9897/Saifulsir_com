import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Atom, Award, Backpack, Book, BookOpen, Calculator, CalendarDays, ClipboardList, Clock, Compass, Crop, FileText, FlaskConical, GraduationCap, Landmark, Library, Lightbulb, Presentation, Rocket, Search, ShieldCheck, Stethoscope, Target, Trophy } from "lucide-react";
import { db } from "@/lib/db";
import { getSite } from "@/lib/site";
import { popularTags } from "@/lib/popular-tags";
import { catPath } from "@/lib/cat-paths";
export const dynamic = "force-dynamic";

type Item = { en: string; bn: string; icon: LucideIcon; tint: string; href?: string; slug?: string };
const q = (s: string) => `/search?q=${encodeURIComponent(s)}`;

const primary: Item[] = [
  { en: "Class 1", bn: "১ম শ্রেণি", icon: Book, tint: "bg-emerald-100 text-emerald-600", href: q("Class 1"), slug: "class-1" },
  { en: "Class 2", bn: "২য় শ্রেণি", icon: Backpack, tint: "bg-sky-100 text-sky-600", href: q("Class 2"), slug: "class-2" },
  { en: "Class 3", bn: "৩য় শ্রেণি", icon: BookOpen, tint: "bg-amber-100 text-amber-600", href: q("Class 3"), slug: "class-3" },
  { en: "Class 4", bn: "৪র্থ শ্রেণি", icon: Lightbulb, tint: "bg-rose-100 text-rose-600", href: q("Class 4"), slug: "class-4" },
  { en: "Class 5", bn: "৫ম শ্রেণি", icon: GraduationCap, tint: "bg-violet-100 text-violet-600", href: q("Class 5"), slug: "class-5" },
  { en: "Class 5 বৃত্তি", bn: "৫ম শ্রেণির বৃত্তি", icon: Award, tint: "bg-yellow-100 text-yellow-700", href: q("Class 5 বৃত্তি"), slug: "class-5-scholarship" },
];
const secondary: Item[] = [
  { en: "Class 6", bn: "৬ষ্ঠ শ্রেণি", icon: GraduationCap, tint: "bg-blue-100 text-blue-600", href: q("Class 6"), slug: "class-6" },
  { en: "Class 7", bn: "৭ম শ্রেণি", icon: Atom, tint: "bg-cyan-100 text-cyan-600", href: q("Class 7"), slug: "class-7" },
  { en: "Class 8", bn: "৮ম শ্রেণি", icon: Compass, tint: "bg-emerald-100 text-emerald-600", href: q("Class 8"), slug: "class-8" },
  { en: "Class 9-10", bn: "এসএসসি", icon: FileText, tint: "bg-amber-100 text-amber-600", href: q("Class 9-10"), slug: "class-9-10" },
  { en: "HSC Books", bn: "এইচএসসি", icon: FlaskConical, tint: "bg-violet-100 text-violet-600", href: q("HSC"), slug: "hsc" },
  { en: "Class 8 বৃত্তি", bn: "৮ম শ্রেণির বৃত্তি", icon: Trophy, tint: "bg-indigo-100 text-indigo-600", href: q("Class 8 বৃত্তি"), slug: "class-8-scholarship" },
];
const compete: Item[] = [
  { en: "Guide Books", bn: "সহায়িকা বই", icon: Library, tint: "bg-slate-100 text-slate-600", href: "/library" },
  { en: "NTRCA", bn: "নিবন্ধন", icon: Presentation, tint: "bg-emerald-100 text-emerald-600", href: "/ntrca" },
  { en: "BCS", bn: "পড়াশোনা", icon: ShieldCheck, tint: "bg-amber-100 text-amber-600", href: q("BCS") },
  { en: "NU Studies", bn: "জাতীয় বিশ্ববিদ্যালয়", icon: Landmark, tint: "bg-indigo-100 text-indigo-600", href: q("NU") },
  { en: "Admission", bn: "ভর্তি গাইড", icon: Rocket, tint: "bg-rose-100 text-rose-600", href: "/admission" },
  { en: "Medical Guide", bn: "মেডিকেল গাইড", icon: Stethoscope, tint: "bg-red-100 text-red-600", href: q("Medical") },
];
const tools: Item[] = [
  { en: "ছবি ও স্বাক্ষর রিসাইজার", bn: "চাকরির আবেদনের জন্য", icon: Crop, tint: "bg-sky-100 text-sky-600", href: "/tools/photo-resizer" },
  { en: "NU CGPA", bn: "রেজাল্ট প্ল্যানার", icon: Calculator, tint: "bg-indigo-100 text-indigo-600", href: "/tools/nu-cgpa" },
  { en: "জিপিএ ক্যালকুলেটর", bn: "৪র্থ বিষয় সহ", icon: Calculator, tint: "bg-emerald-100 text-emerald-600", href: "/tools/gpa" },
  { en: "কভার পেজ মেকার", bn: "অ্যাসাইনমেন্ট", icon: ClipboardList, tint: "bg-violet-100 text-violet-600", href: "/tools/cover-page" },
  { en: "ভর্তি যোগ্যতা", bn: "বাছাই ক্যালকুলেটর", icon: Target, tint: "bg-amber-100 text-amber-600" },
];
const chips = [["HSC সাজেশন", "HSC"], ["দাখিল ২০২৭", "দাখিল"], ["আলিম ২০২৭", "আলিম"], ["BCS প্রস্তুতি", "BCS"], ["NTRCA পরীক্ষা", "NTRCA"]];

function Head({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative my-6 flex items-center justify-center">
      <span className="absolute inset-x-0 top-1/2 h-px bg-slate-200" />
      <h2 className="relative rounded-full border border-slate-200 bg-white px-5 py-1.5 font-bold text-royal">{children}</h2>
    </div>
  );
}
function Card({ it }: { it: Item }) {
  const Icon = it.icon;
  const cls = "flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm";
  const inner = (
    <>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${it.tint}`}><Icon size={22} /></span>
      <span className="min-w-0"><span className="block font-semibold">{it.en}</span><span className="block text-sm text-slate-500">{it.bn}</span></span>
      {!it.href && <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">শীঘ্রই</span>}
    </>
  );
  return it.href ? <Link href={it.href} className={`${cls} transition hover:border-royal hover:shadow`}>{inner}</Link> : <div className={`${cls} opacity-70`}>{inner}</div>;
}
const Grid = ({ items }: { items: Item[] }) => <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((it) => <Card key={it.en} it={it} />)}</div>;
const fmt = (d: Date) => d.toLocaleDateString("en-GB", { dateStyle: "medium" });

export default async function Home() {
  const [posts, trending, quotes, cats, site, tags] = await Promise.all([
    db.post.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 4 }).catch(() => []),
    db.resource.findMany({ orderBy: [{ downloads: "desc" }, { createdAt: "desc" }], take: 7 }).catch(() => []),
    db.testimonial.findMany({ orderBy: { createdAt: "desc" }, take: 3 }).catch(() => []),
    db.category.findMany({ select: { slug: true } }).catch(() => []),
    getSite(),
    popularTags(10),
  ]);
  const slugSet = new Set(cats.map((c) => c.slug));
  const resolve = (items: Item[]) => items.map((it) => (it.slug && slugSet.has(it.slug) ? { ...it, href: `/category/${it.slug}` } : it));
  return (
    <main>
      <section className="bg-gradient-to-b from-blue-50 to-paper px-4 pb-10 pt-10 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="mx-auto inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-800">{site.heroBadge}</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">{site.heroTitle}</h1>
          <p className="mt-3 text-slate-600">{site.heroSubtitle}</p>
          <form action="/search" className="mx-auto mt-6 flex max-w-2xl items-center gap-2 rounded-full border border-slate-300 bg-white p-1.5 shadow-sm">
            <input name="q" placeholder="বই বা বিষয়ের নাম লিখুন..." aria-label="Search" className="min-w-0 flex-1 bg-transparent px-4 py-2.5 outline-none" />
            <button className="flex items-center gap-2 rounded-full bg-royal px-5 py-2.5 font-semibold text-white"><Search size={18} />খুঁজুন</button>
          </form>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {chips.map(([l, s]) => <Link key={l} href={q(s)} className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm hover:border-royal hover:text-royal">{l}</Link>)}
            <Link href="/tools/photo-resizer" className="flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-4 py-1.5 text-sm text-sky-700"><Crop size={16} />ছবি রিসাইজার</Link>
          </div>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2" aria-label="Popular tags">
              {tags.map(([t]) => <Link key={t} href={`/tag/${encodeURIComponent(t)}`} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-royal hover:bg-blue-100">#{t}</Link>)}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <Head>প্রাথমিক স্তর</Head><Grid items={resolve(primary)} />
        <Head>মাধ্যমিক স্তর</Head><Grid items={resolve(secondary)} />
        <Head>প্রতিযোগিতামূলক পরীক্ষা</Head><Grid items={compete} />
        <Head>শিক্ষার্থী সেবা ও প্রয়োজনীয় অনলাইন টুলস</Head><Grid items={tools} />

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h2 className="text-2xl font-bold">Latest Articles</h2>
            {posts.length === 0 && <p className="mt-4 text-slate-600">শীঘ্রই নতুন লেখা আসছে।</p>}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {posts.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug ?? p.id}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                  <div className="relative aspect-video bg-gradient-to-br from-royal to-sky-400">
                    {p.coverUrl && <Image src={p.coverUrl} alt={p.coverAlt ?? p.title} fill sizes="(max-width: 640px) 100vw, 360px" className="object-cover" />}
                    <span className="absolute left-3 top-3 rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-white">BLOG</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold leading-snug">{p.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">{p.metaDescription || p.body}</p>
                    <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><CalendarDays size={14} />{fmt(p.createdAt)}</span>
                      <span className="flex items-center gap-1"><Clock size={14} />{Math.max(1, Math.ceil(p.body.length / 900))} min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold"><span className="h-3 w-3 rounded-full bg-emerald-500" />TREND POSTS</h2>
            {trending.length === 0 && <p className="mt-4 text-sm text-slate-600">ম্যাটেরিয়াল যোগ হলে এখানে দেখাবে।</p>}
            <ol className="mt-4 grid gap-4">
              {trending.map((r, i) => (
                <li key={r.id}>
                  <Link href={catPath[r.category] ?? "/"} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-royal text-sm font-bold text-white">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="rounded bg-emerald-700 px-2 py-0.5 text-xs font-bold text-white">{r.category.toUpperCase()}</span>
                      <span className="mt-1 block font-semibold leading-snug">{r.title}</span>
                      <span className="text-xs text-slate-500">{fmt(r.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {quotes.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-bold">What students say</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {quotes.map((t) => (
                <figure key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5"><blockquote>{t.quote}</blockquote>
                  <figcaption className="mt-3 text-sm text-slate-600">{t.name}{t.role && `, ${t.role}`}</figcaption></figure>
              ))}
            </div>
          </section>
        )}
        <section className="mt-14 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-navy-800 p-8 text-white"><h2 className="text-2xl font-bold">Practice with AI</h2><p className="mt-1 text-slate-300">টপিক বেছে নিন, বাংলা ব্যাখ্যাসহ নতুন কুইজ পান।</p>
            <Link href="/quiz" className="mt-4 inline-block rounded-xl bg-royal px-5 py-3 font-semibold">কুইজ শুরু করুন</Link></div>
          <div className="rounded-2xl bg-hire p-8 text-white"><h2 className="text-2xl font-bold">ওয়েব ডেভেলপার দরকার?</h2><p className="mt-1">আপনার প্রজেক্টের জন্য Saiful Islam কে হায়ার করুন।</p>
            <Link href="/hire" className="mt-4 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-slate-900">পোর্টফোলিও দেখুন</Link></div>
        </section>
      </div>
    </main>
  );
}
