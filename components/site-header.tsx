"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight, Bookmark, BookOpen, Briefcase, Home,
  LayoutDashboard, LogOut, Menu, Search, X, ChevronDown,
  Sparkles
} from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import SavedLink from "@/components/saved-link";
import MobileHeaderDrawer from "@/components/MobileHeaderDrawer";

type U = { name?: string | null; role?: string } | null;

type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

const navTree: NavItem[] = [
  { label: "পরীক্ষা দাও (AI)", href: "/exam" },
  { label: "সংবাদ", href: "/news" }, // 📰 শিক্ষা সংবাদ পেজের লিংক
  { label: "নোট", href: "/academic" },
  { label: "ভর্তি", href: "/admission" },
  {
    label: "NTRCA",
    href: "/ntrca",
    children: [
      { label: "স্কুল পর্যায়-2", href: "/ntrca/school-2" },
      { label: "স্কুল পর্যায়", href: "/ntrca/school" },
      { label: "কলেজ পর্যায়", href: "/ntrca/college" },
      { label: "প্রিলিমিনারি প্রিপারেশন", href: "/ntrca/preli" },
      { label: "লিখিত সাজেশন", href: "/ntrca/written" },
      { label: "শুন্য পদ", href: "/ntrca/vacant" },
    ],
  },
  { label: "জব", href: "/jobs" },
  { label: "ই-বুক", href: "/library" },
  { label: "ভিডিও", href: "/videos" },
  { label: "মডেল টেস্ট", href: "/tests" },
  { label: "টুলস", href: "/tools" },
  { label: "ব্লগ", href: "/blog" },
];

const tabs = [
  ["Home", "/", Home],
  ["Exam", "/exam", Sparkles],
  ["Classes", "/academic", BookOpen],
  ["Save", "/saved", Bookmark],
  ["Search", "/search", Search]
] as const;

function Announcement({ text }: { text: string }) {
  const key = `ann:${text}`;
  const [hidden, setHidden] = useState(false);
  useEffect(() => { try { if (sessionStorage.getItem(key)) setHidden(true); } catch {} }, [key]);
  if (hidden || !text) return null;
  const close = () => { setHidden(true); try { sessionStorage.setItem(key, "1"); } catch {} };
  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-800 to-royal px-3 py-2 text-sm text-white">
      <span aria-hidden="true">🔔</span>
      <p className="min-w-0 flex-1 truncate">{text}</p>
      <Link href="/blog" className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900">
        এখনই দেখুন<ArrowRight size={14} />
      </Link>
      <button onClick={close} aria-label="Close notice" className="shrink-0 rounded p-1 hover:bg-white/10"><X size={18} /></button>
    </div>
  );
}

export default function SiteHeader({ user, logout, notice }: { user: U; logout: () => Promise<void>; notice: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // 🔒 শুধুমাত্র ADMIN হলে true হবে (Teacher বা Student দেখতে পাবে না)
  const isAdmin = user?.role === "ADMIN";
  const on = (h: string) => (h === "/" ? path === "/" : path === h || path.startsWith(h + "/"));

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = prev; };
  }, [open]);

  const btn = "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold";
  const outline = `${btn} border border-slate-300 bg-white text-navy-900 hover:bg-slate-50`;
  const actions = (
    <>
      <Link href="/hire" className={`${btn} bg-hire text-white hover:bg-orange-600`}><Briefcase size={16} />Hire Me</Link>
      {/* 🔒 শুধুমাত্র ADMIN লগইন করলেই এই বাটনটি আসবে */}
      {isAdmin && <Link href="/admin" className={outline}><LayoutDashboard size={16} />Dashboard</Link>}
      {user ? (
        <form action={logout}><button className={`${outline} w-full`}><LogOut size={16} />Log out</button></form>
      ) : (
        <Link href="/login" className={outline}>Login / Register</Link>
      )}
    </>
  );

  return (
    <>
      <Announcement text={notice} />
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
          <button onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="shrink-0 rounded-lg p-2 text-navy-900 hover:bg-slate-100 xl:hidden">
            <Menu size={24} />
          </button>
          
          {/* 🖼️ লোগো ফিক্স (unoptimized যুক্ত করা হলো) */}
          <Link href="/" aria-label="SaifulSir.com home" className="shrink-0">
            <Image 
              src="/logo.png" 
              alt="SaifulSir.com" 
              width={689} 
              height={245} 
              priority 
              unoptimized
              className="h-8 w-auto sm:h-11" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-0.5 whitespace-nowrap xl:flex">
            {navTree.map((item) => (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  aria-current={on(item.href) ? "page" : undefined}
                  className={`flex items-center gap-1 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                    on(item.href) ? "bg-blue-50 text-ro
