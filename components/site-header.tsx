"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ArrowRight, Bookmark, BookOpen, Briefcase, Home, 
  LayoutDashboard, LogOut, Menu, Search, X, ChevronDown 
} from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import SavedLink from "@/components/saved-link";

type U = { name?: string | null; role?: string } | null;

// Sub-menu structure er jonno Navigation Tree
type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

const navTree: NavItem[] = [
  { label: "নোট", href: "/academic" },
  { label: "ভর্তি", href: "/admission" },
  {
    label: "NTRCA",
    href: "/ntrca",
    children: [
      { label: "স্কুল পর্যায়-2", href: "/ntrca/school-2" },
      { label: "স্কুল পর্যায়", href: "/ntrca/school" },
      { label: "কলেজ পর্যায়", href: "/ntrca/college" },
      { label: "প্রিলিমিনারি প্রিপারেশন", href: "/ntrca/preli" },
      { label: "লিখিত সাজেশন", href: "/ntrca/written" },
      { label: "শুন্য পদ", href: "/ntrca/vacant" },
    ],
  },
  { label: "জব", href: "/jobs" },
  { label: "AI কুইজ", href: "/quiz" },
  { label: "ই-বুক", href: "/library" },
  { label: "ভিডিও", href: "/videos" },
  { label: "মডেল টেস্ট", href: "/tests" },
  { label: "টুলস", href: "/tools" },
  { label: "ব্লগ", href: "/blog" },
];

const tabs = [
  ["Home", "/", Home], 
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
  
  // Mobile e kon dropdown-ti open ache ta track rakhar jonno state
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const staff = user?.role === "ADMIN" || user?.role === "TEACHER";
  const on = (h: string) => (h === "/" ? path === "/" : path === h || path.startsWith(h + "/"));

  useEffect(() => { 
    setOpen(false); 
    setOpenSubMenu(null);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = prev; };
  }, [open]);

  const toggleSubMenu = (label: string) => {
    setOpenSubMenu(openSubMenu === label ? null : label);
  };

  const btn = "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold";
  const outline = `${btn} border border-slate-300 bg-white text-navy-900 hover:bg-slate-50`;
  const actions = (
    <>
      <Link href="/hire" className={`${btn} bg-hire text-white hover:bg-orange-600`}><Briefcase size={16} />Hire Me</Link>
      {staff && <Link href="/admin" className={outline}><LayoutDashboard size={16} />Dashboard</Link>}
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
          <Link href="/" aria-label="SaifulSir.com home" className="shrink-0">
            <Image src="/logo.png" alt="SaifulSir.com" width={689} height={245} priority className="h-8 w-auto sm:h-11" />
          </Link>

          {/* Desktop Navigation with Hover Dropdown */}
          <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-0.5 whitespace-nowrap xl:flex">
            {navTree.map((item) => (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  aria-current={on(item.href) ? "page" : undefined}
                  className={`flex items-center gap-1 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                    on(item.href) ? "bg-blue-50 text-royal" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                  {item.children && <ChevronDown size={14} className="text-slate-500 transition-transform group-hover:rotate-180" />}
                </Link>

                {/* Desktop Dropdown Submenu */}
                {item.children && (
                  <div className="absolute left-0 top-full hidden w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg group-hover:block">
                    {item.children.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-royal"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <form action="/search" role="search" className="flex min-w-0 flex-1 items-center rounded-full border border-slate-300 bg-white px-3 xl:max-w-[14rem] xl:flex-none">
            <Search size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
            <input name="q" aria-label="Search" placeholder="Search anything" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none" />
          </form>
          <SavedLink />
          <ThemeToggle />
          <div className="hidden items-center gap-2 xl:flex">{actions}</div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85%] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-3">
              <Image src="/logo.png" alt="SaifulSir.com" width={689} height={245} className="h-10 w-auto" />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-lg p-2 hover:bg-slate-100"><X size={22} /></button>
            </div>
            
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-3 space-y-1">
              <Link href="/" className={`block rounded-xl px-4 py-3 font-medium ${on("/") ? "bg-blue-50 text-royal" : "text-slate-700 hover:bg-slate-100"}`}>
                হোম
              </Link>

              {navTree.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isSubOpen = openSubMenu === item.label;

                return (
                  <div key={item.href}>
                    {hasChildren ? (
                      <div>
                        <div
                          className={`flex items-center justify-between rounded-xl px-4 py-3 font-medium cursor-pointer ${
                            on(item.href) ? "bg-blue-50 text-royal" : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <Link href={item.href} className="flex-1">
                            {item.label}
                          </Link>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              toggleSubMenu(item.label);
                            }}
                            className="p-1 hover:bg-slate-200/50 rounded-lg"
                          >
                            <ChevronDown size={18} className={`transition-transform ${isSubOpen ? "rotate-180" : ""}`} />
                          </button>
                        </div>

                        {/* Mobile Collapsible Sub-menu */}
                        {isSubOpen && (
                          <div className="ml-4 mt-1 border-l-2 border-slate-200 pl-3 space-y-1">
                            {item.children?.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                                  on(sub.href) ? "text-royal font-semibold" : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`block rounded-xl px-4 py-3 font-medium ${
                          on(item.href) ? "bg-blue-50 text-royal" : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}

              <Link href="/saved" className={`block rounded-xl px-4 py-3 font-medium ${on("/saved") ? "bg-blue-50 text-royal" : "text-slate-700 hover:bg-slate-100"}`}>
                সংরক্ষিত
              </Link>
            </nav>

            <div className="grid gap-2 border-t border-slate-200 p-3">
              {user?.name && <p className="px-1 text-sm text-slate-500">Signed in as {user.name}</p>}
              {actions}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar Navigation for Mobile */}
      <nav aria-label="Bottom" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        {tabs.map(([l, h, Icon]) => (
          <Link key={h} href={h} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${on(h) ? "text-royal" : "text-slate-500"}`}>
            <Icon size={22} />{l}
          </Link>
        ))}
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium text-slate-500">
          <Menu size={22} />Menu
        </button>
      </nav>
    </>
  );
}
