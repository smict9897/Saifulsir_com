"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ArrowRight, Briefcase, ChevronDown, 
  LayoutDashboard, LogOut, Menu, Search, X,
  GraduationCap, Sparkles, Wrench
} from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import SavedLink from "@/components/saved-link";

type U = { name?: string | null; role?: string } | null;

// 🎓 সম্পূর্ণ ভেক্টর প্রফেশনাল লোগো কম্পোনেন্ট
function SiteLogo() {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3 select-none">
      {/* ভেক্টর মনোগ্রাম আইকন */}
      <div className="relative flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-sm"
        >
          <defs>
            <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>

          {/* ব্যাকগ্রাউন্ড স্কয়ার */}
          <rect width="48" height="48" rx="13" fill="url(#primaryGrad)" />

          {/* গ্র্যাজুয়েশন ক্যাপের উপরের অংশ */}
          <path
            d="M24 11L38 18L24 25L10 18L24 11Z"
            fill="white"
            fillOpacity="0.95"
          />

          {/* 'S' আকৃতির কার্ভ */}
          <path
            d="M15 22.5V29C15 32.5 19 35.5 24 35.5C29 35.5 33 32.5 33 29V22.5L24 27L15 22.5Z"
            fill="url(#cyanGrad)"
          />

          {/* গোল্ডেন ক্যাপ ট্যাসেল */}
          <circle cx="36.5" cy="22" r="2" fill="#FBBF24" />
          <path d="M36.5 22V26" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* ব্র্যান্ড টেক্সট */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1 leading-none">
          <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Saiful<span className="text-blue-600">Sir</span>
          </span>
          <span className="rounded bg-blue-50 dark:bg-blue-950 px-1 py-0.5 text-[9px] sm:text-[10px] font-black text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            .COM
          </span>
        </div>
        <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider mt-0.5 sm:mt-1">
          স্মার্ট শিক্ষা প্ল্যাটফর্ম
        </span>
      </div>
    </div>
  );
}

const groupedNav = [
  {
    label: "প্রস্তুতি ও রিসোর্স",
    icon: GraduationCap,
    items: [
      { label: "একাডেমিক নোট", href: "/academic", desc: "৬ষ্ঠ থেকে ১২শ শ্রেণির বিষয়ভিত্তিক নোট" },
      { label: "বিশ্ববিদ্যালয় ভর্তি", href: "/admission", desc: "মেডিকেল ও ভার্সিটি প্রশ্নব্যাংক" },
      { label: "NTRCA শিক্ষক নিবন্ধন", href: "/ntrca", desc: "স্কুল, কলেজ ও প্রিলি প্রস্তুতি" },
      { label: "জব সার্কুলার ও প্রস্তুতি", href: "/jobs", desc: "সরকারি ও বেসরকারি চাকরির গাইড" },
    ],
  },
  {
    label: "অনুশীলন ও কুইজ",
    icon: Sparkles,
    highlight: true,
    items: [
      { label: "ফ্রি প্রশ্নপত্র তৈরি (AI)", href: "/quiz", desc: "যেকোনো বিষয়ের ইনস্ট্যান্ট প্রশ্ন তৈরি" },
      { label: "মডেল টেস্ট ও এক্সাম", href: "/tests", desc: "লাইভ পরীক্ষা দিয়ে মেধা যাচাই" },
      { label: "ভিডিও লেসন", href: "/videos", desc: "টপিকভিত্তিক সহজ ক্লাস" },
    ],
  },
  {
    label: "স্টুডেন্ট টুলস",
    icon: Wrench,
    items: [
      { label: "টুলস হাব (সকল টুলস)", href: "/tools", desc: "সবগুলো ফ্রি টুলস একসাথে" },
      { label: "ই-বুক ও লাইব্রেরি", href: "/library", desc: "বিনামূল্যে পাঠ্যবই ও গাইড বই" },
    ],
  },
  {
    label: "ব্লগ",
    href: "/blog",
  },
];

function Announcement({ text }: { text: string }) {
  const key = `ann:${text}`;
  const [hidden, setHidden] = useState(false);
  useEffect(() => { try { if (sessionStorage.getItem(key)) setHidden(true); } catch {} }, [key]);
  if (hidden || !text) return null;
  const close = () => { setHidden(true); try { sessionStorage.setItem(key, "1"); } catch {} };
  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 px-3 py-1.5 text-xs sm:text-sm text-white shadow-inner">
      <span aria-hidden="true" className="animate-bounce">🔔</span>
      <p className="min-w-0 flex-1 truncate font-medium">{text}</p>
      <Link href="/blog" className="flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-blue-900 shadow-sm hover:bg-blue-50 transition">
        দেখুন<ArrowRight size={13} />
      </Link>
      <button onClick={close} aria-label="Close notice" className="shrink-0 rounded p-1 hover:bg-white/20 transition"><X size={16} /></button>
    </div>
  );
}

export default function SiteHeader({ user, logout, notice }: { user: U; logout: () => Promise<void>; notice: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const staff = user?.role === "ADMIN" || user?.role === "TEACHER";
  const on = (h: string) => (h === "/" ? path === "/" : path === h || path.startsWith(h + "/"));

  useEffect(() => { 
    setOpen(false); 
    setOpenAccordion(null);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = prev; };
  }, [open]);

  const btn = "inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all";
  const outline = `${btn} border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm`;

  const actions = (
    <>
      <Link href="/hire" className={`${btn} bg-orange-600 text-white hover:bg-orange-700 shadow-sm shadow-orange-500/20`}>
        <Briefcase size={15} />Hire Me
      </Link>
      {staff && (
        <Link href="/admin" className={outline}>
          <LayoutDashboard size={15} />Dashboard
        </Link>
      )}
      {user ? (
        <form action={logout}>
          <button className={`${outline} w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30`}>
            <LogOut size={15} />লগআউট
          </button>
        </form>
      ) : (
        <Link href="/login" className={`${btn} bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20`}>
          লগইন / রেজিস্টার
        </Link>
      )}
    </>
  );

  return (
    <>
      <Announcement text={notice} />

      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-4">
          
          {/* Logo & Mobile Hamburger */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setOpen(true)} 
              aria-label="Open menu" 
              className="shrink-0 rounded-xl p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu size={22} />
            </button>
            <Link href="/" aria-label="SaifulSir.com home" className="shrink-0 flex items-center">
              <SiteLogo />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav aria-label="Main" className="hidden lg:flex items-center gap-1">
            <Link 
              href="/" 
              className={`px-3 py-2 text-sm font-semibold rounded-xl transition ${
                on("/") ? "text-blue-600 bg-blue-50/80 dark:bg-blue-950/40" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              হোম
            </Link>

            {groupedNav.map((cat) => {
              if (cat.href) {
                return (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className={`px-3 py-2 text-sm font-semibold rounded-xl transition ${
                      on(cat.href) ? "text-blue-600 bg-blue-50/80 dark:bg-blue-950/40" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {cat.label}
                  </Link>
                );
              }

              return (
                <div key={cat.label} className="relative group">
                  <button className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    <span>{cat.label}</span>
                    <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                  </button>

                  <div className="absolute top-full left-0 mt-1 hidden w-72 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl group-hover:block transition-all">
                    {cat.items?.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`block p-2.5 rounded-xl transition ${
                          on(sub.href) ? "bg-blue-50 dark:bg-blue-950/50" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{sub.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub.desc}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            <form action="/search" role="search" className="hidden sm:flex items-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-950 transition w-44 md:w-56">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input 
                name="q" 
                placeholder="নোট বা প্রশ্ন খুঁজুন..." 
                className="w-full bg-transparent px-2 text-xs md:text-sm outline-none text-slate-800 dark:text-slate-200" 
              />
            </form>

            <SavedLink />
            <ThemeToggle />

            <div className="hidden lg:flex items-center gap-2 ml-1">
              {actions}
            </div>
          </div>

        </div>
      </header>

      {/* Mobile Drawer (Side Menu) */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-80 max-w-[85%] flex-col bg-white dark:bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4">
              <SiteLogo />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>

            <div className="p-3 border-b border-slate-100 dark:border-slate-800 sm:hidden">
              <form action="/search" className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input name="q" placeholder="কী খুঁজতে চান?" className="w-full bg-transparent px-2 text-sm outline-none" />
              </form>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              <Link href="/" className={`block rounded-xl px-4 py-2.5 font-medium ${on("/") ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                হোম
              </Link>

              {groupedNav.map((cat) => {
                if (cat.href) {
                  return (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className={`block rounded-xl px-4 py-2.5 font-medium ${on(cat.href) ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                    >
                      {cat.label}
                    </Link>
                  );
                }

                const isOpen = openAccordion === cat.label;
                return (
                  <div key={cat.label} className="rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenAccordion(isOpen ? null : cat.label)}
                      className="flex w-full items-center justify-between px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <span>{cat.label}</span>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isOpen && (
                      <div className="pl-4 pr-2 py-1 space-y-1 bg-slate-50 dark:bg-slate-800/40 rounded-xl mb-1">
                        {cat.items?.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`block rounded-lg px-3 py-2 text-sm ${on(sub.href) ? "text-blue-600 font-bold" : "text-slate-600 dark:text-slate-400"}`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <Link href="/saved" className={`block rounded-xl px-4 py-2.5 font-medium ${on("/saved") ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                সংরক্ষিত বিষয়সমূহ
              </Link>
            </nav>

            <div className="grid gap-2 border-t border-slate-100 dark:border-slate-800 p-4">
              {user?.name && <p className="text-xs text-slate-500 mb-1">Signed in as {user.name}</p>}
              {actions}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
