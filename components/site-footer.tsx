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

const groups: { title: string; items: Item[] }[] = [
  { title: "শিক্ষার্থী সেবা ও টুলস", items: [
    ["AI কুইজ প্র্যাকটিস", "/quiz", Sparkles, "text-amber-400"], ["মডেল টেস্ট ও লিডারবোর্ড", "/tests", ListChecks, "text-blue-400"],
    ["জিপিএ ক্যালকুলেটর", "/tools/gpa", Calculator, "text-emerald-400"], ["NU CGPA ও রেজাল্ট প্ল্যানার", "/tools/nu-cgpa", GraduationCap, "text-indigo-300"],
    ["কভার পেজ মেকার", "/tools/cover-page", ClipboardList, "text-violet-400"], ["ছবি ও স্বাক্ষর রিসাইজার", "/tools/photo-resizer", Crop, "text-sky-400"],
  ] },
  { title: "জনপ্রিয় বিভাগসমূহ", items: [
    ["একাডেমিক নোট (৬ থেকে ১২)", "/academic", BookOpen, "text-sky-400"], ["বিশ্ববিদ্যালয় ভর্তি", "/admission", GraduationCap, "text-amber-400"],
    ["শিক্ষক নিবন্ধন (NTRCA)", "/ntrca", PenSquare, "text-rose-400"], ["ই-বুক লাইব্রেরি", "/library", Library, "text-emerald-400"],
    ["জব সার্কুলার", "/jobs", Briefcase, "text-emerald-300"], ["ভিডিও লেসন", "/videos", PlayCircle, "text-red-400"], ["ব্লগ", "/blog", Newspaper, "text-violet-400"],
  ] },
  { title: "নীতিমালা ও সহায়তা", items: [
    ["আমাদের সম্পর্কে (About Us)", "/about-us", User, "text-blue-400"],
    ["যোগাযোগ করুন (Contact)", "/contact", Mail, "text-emerald-400"],
    ["Hire Me (Developer)", "/hire", Code2, "text-orange-400"], 
    ["Privacy Policy", "/privacy", ShieldCheck, "text-sky-400"],
    ["Terms of Service", "/terms", FileText, "text-slate-300"],
  ] },
];

export default async function SiteFooter() {
  const [site, pages] = await Promise.all([getSite(), db.page.findMany({ select: { slug: true, title: true }, orderBy: { title: "asc" } }).catch(() => [])]);
  const { contact, footerText } = site;
  const links = site.social.filter((s) => s.url);
  const tile = "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10";
  return (
    <footer className="mt-20 bg-navy-900 pb-24 text-sm text-slate-300 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-4">
        <div>
          <Link href="/" aria-label="SaifulSir.com home" className="inline-block rounded-xl bg-white px-3 py-2">
            <Image src="/logo.png" alt="SaifulSir.com" width={689} height={245} className="h-10 w-auto" />
          </Link>
          <p className="mt-4 max-w-sm leading-relaxed">{footerText}</p>
          {links.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              {links.map(({ name, icon: Icon, url }) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name} title={name}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-white transition hover:opacity-90 ${tint[name] ?? "bg-slate-600"}`}>
                  <Icon size={22} />
                </a>
              ))}
            </div>
          )}
        </div>
        {groups.map((g, gi) => (
          <div key={g.title}>
            <h2 className="text-lg font-bold text-white">{g.title}</h2>
            <span className="mt-2 block h-1 w-12 rounded-full bg-royal" />
            <ul className="mt-5 grid gap-3">
              {g.items.map(([label, href, Icon, color]) => (
                <li key={href}>
                  <Link href={href} className="flex items-center gap-3 hover:text-white">
                    <span className={tile}><Icon size={20} className={color} /></span><span>{label}</span>
                  </Link>
                </li>
              ))}
              {gi === 2 && pages.map((pg) => (
                <li key={pg.slug}><Link href={`/p/${pg.slug}`} className="flex items-center gap-3 hover:text-white"><span className={tile}><FileText size={20} className="text-slate-300" /></span><span>{pg.title}</span></Link></li>
              ))}
              {gi === 2 && contact.phone && (
                <li><a href={`tel:${contact.phone}`} className="flex items-center gap-3 hover:text-white"><span className={tile}><Phone size={20} className="text-emerald-400" /></span>{contact.phone}</a></li>
              )}
              {gi === 2 && contact.email && (
                <li><a href={`mailto:${contact.email}`} className="flex items-center gap-3 hover:text-white"><span className={tile}><Mail size={20} className="text-sky-400" /></span>{contact.email}</a></li>
              )}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs">© {new Date().getFullYear()} SaifulSir.com</div>
    </footer>
  );
}
