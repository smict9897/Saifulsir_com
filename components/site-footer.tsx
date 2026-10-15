import Image from "next/image";
import Link from "next/link";
import { BookOpen, Briefcase, Calculator, ClipboardList, Code2, Crop, FileText, GraduationCap, Library, ListChecks, Mail, Newspaper, PenSquare, Phone, PlayCircle, ShieldCheck, Sparkles, User, type LucideIcon } from "lucide-react";
import { db } from "@/lib/db";
import { getSite } from "@/lib/site";

type Item = [label: string, href: string, icon: LucideIcon, color: string];
const tint: Record<string, string> = {
  YouTube: "bg-red-600", Facebook: "bg-blue-600", Instagram: "bg-pink-600", LinkedIn: "bg-blue-700",
  GitHub: "bg-slate-700", Telegram: "bg-sky-500", WhatsApp: "bg-emerald-600",
};

const studentTools: Item[] = [
  ["AI কুইজ প্র্যাকটিস", "/quiz", Sparkles, "text-amber-400"],
  ["মডেল টেস্ট ও লিডারবোর্ড", "/tests", ListChecks, "text-blue-400"],
  ["জিপিএ ক্যালকুলেটর", "/tools/gpa", Calculator, "text-emerald-400"],
  ["NU CGPA ও রেজাল্ট প্ল্যানার", "/tools/nu-cgpa", GraduationCap, "text-indigo-300"],
  ["কভার পেজ মেকার", "/tools/cover-page", ClipboardList, "text-violet-400"],
  ["ছবি ও স্বাক্ষর রিসাইজার", "/tools/photo-resizer", Crop, "text-sky-400"],
];

const popularCategories: Item[] = [
  ["একাডেমিক নোট (৬ থেকে ১২)", "/academic", BookOpen, "text-sky-400"],
  ["বিশ্ববিদ্যালয় ভর্তি", "/admission", GraduationCap, "text-amber-400"],
  ["শিক্ষক নিবন্ধন (NTRCA)", "/ntrca", PenSquare, "text-rose-400"],
  ["ই-বুক লাইব্রেরি", "/library", Library, "text-emerald-400"],
  ["জব সার্কুলার", "/jobs", Briefcase, "text-emerald-300"],
  ["ভিডিও লেসন", "/videos", PlayCircle, "text-red-400"],
  ["ব্লগ", "/blog", Newspaper, "text-violet-400"],
];

const supportPolicies: Item[] = [
  ["আমাদের সম্পর্কে (About Us)", "/about-us", User, "text-blue-400"],
  ["যোগাযোগ করুন (Contact)", "/contact", Mail, "text-emerald-400"],
  ["Hire Me (Developer)", "/hire", Code2, "text-orange-400"],
  ["Privacy Policy", "/privacy", ShieldCheck, "text-sky-400"],
  ["Terms of Service", "/terms", FileText, "text-slate-300"],
];

export default async function SiteFooter() {
  const [site, pages] = await Promise.all([
    getSite(),
    db.page.findMany({ select: { slug: true, title: true }, orderBy: { title: "asc" } }).catch(() => [])
  ]);
  const { contact, footerText } = site;
  const links = site.social.filter((s) => s.url);
  const tile = "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10";

  return (
    <footer className="mt-20 bg-slate-950 pb-24 text-sm text-slate-300 md:pb-0 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* বাম কলাম: লোগো, বিবরণ, সোশ্যাল লিংক এবং জনপ্রিয় বিভাগসমূহ */}
        <div className="space-y-10">
          <div>
            <Link href="/" aria-label="SaifulSir.com home" className="inline-block rounded-xl bg-white px-3 py-2">
              <Image src="/logo.png" alt="SaifulSir.com" width={689} height={245} className="h-10 w-auto" />
            </Link>
            <p className="mt-4 max-w-md leading-relaxed text-slate-400">{footerText}</p>
            {links.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-3">
                {links.map(({ name, icon: Icon, url }) => (
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name} title={name}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-white transition hover:opacity-90 ${tint[name] ?? "bg-slate-600"}`}>
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* জনপ্রিয় বিভাগসমূহ */}
          <div>
            <h2 className="text-lg font-bold text-white">জনপ্রিয় বিভাগসমূহ</h2>
            <span className="mt-2 block h-1 w-12 rounded-full bg-blue-600" />
            <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {popularCategories.map(([label, href, Icon, color]) => (
                <li key={href}>
                  <Link href={href} className="flex items-center gap-3 hover:text-white transition">
                    <span className={tile}><Icon size={18} className={color} /></span>
                    <span className="truncate">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ডান কলাম: শিক্ষার্থী সেবা ও টুলস এবং নীতিমালা ও সহায়তা */}
        <div className="space-y-10">
          {/* শিক্ষার্থী সেবা ও টুলস */}
          <div>
            <h2 className="text-lg font-bold text-white">শিক্ষার্থী সেবা ও টুলস</h2>
            <span className="mt-2 block h-1 w-12 rounded-full bg-blue-600" />
            <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {studentTools.map(([label, href, Icon, color]) => (
                <li key={href}>
                  <Link href={href} className="flex items-center gap-3 hover:text-white transition">
                    <span className={tile}><Icon size={18} className={color} /></span>
                    <span className="truncate">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* নীতিমালা ও সহায়তা */}
          <div>
            <h2 className="text-lg font-bold text-white">নীতিমালা ও সহায়তা</h2>
            <span className="mt-2 block h-1 w-12 rounded-full bg-blue-600" />
            <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {supportPolicies.map(([label, href, Icon, color]) => (
                <li key={href}>
                  <Link href={href} className="flex items-center gap-3 hover:text-white transition">
                    <span className={tile}><Icon size={18} className={color} /></span>
                    <span className="truncate">{label}</span>
                  </Link>
                </li>
              ))}
              {pages.map((pg) => (
                <li key={pg.slug}>
                  <Link href={`/p/${pg.slug}`} className="flex items-center gap-3 hover:text-white transition">
                    <span className={tile}><FileText size={18} className="text-slate-300" /></span>
                    <span className="truncate">{pg.title}</span>
                  </Link>
                </li>
              ))}
              {contact.phone && (
                <li>
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-3 hover:text-white transition">
                    <span className={tile}><Phone size={18} className="text-emerald-400" /></span>
                    <span className="truncate">{contact.phone}</span>
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-3 hover:text-white transition">
                    <span className={tile}><Mail size={18} className="text-sky-400" /></span>
                    <span className="truncate">{contact.email}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

      </div>

      {/* একদম নিচের ফুটার বার (Copyright & Quick Bottom Links) */}
      <div className="border-t border-slate-800 py-6 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} SaifulSir.com — শিক্ষার্থীদের পাশে সার্বক্ষণিক</p>
          <div className="flex flex-wrap gap-6 text-slate-300">
            <Link href="/about-us" className="hover:text-white transition">About Us</Link>
            <Link href="/contact" className="hover:text-white transition">Contact Us</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
