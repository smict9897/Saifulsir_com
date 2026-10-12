"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, LayoutDashboard, LogOut, Menu, X } from "lucide-react";

const nav = [
  ["Notes", "/academic"], ["Admission", "/admission"], ["NTRCA", "/ntrca"], ["Jobs", "/jobs"],
  ["AI Quiz", "/quiz"], ["E-Books", "/library"], ["Videos", "/videos"], ["Tests", "/tests"], ["Blog", "/blog"],
] as const;

type U = { name?: string | null; role?: string } | null;

export default function SiteHeader({ user, logout }: { user: U; logout: () => Promise<void> }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const staff = user?.role === "ADMIN" || user?.role === "TEACHER";
  const on = (h: string) => path === h || path.startsWith(h + "/");
  const desk = (h: string) =>
    `rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${on(h) ? "bg-blue-50 text-royal" : "text-slate-700 hover:bg-slate-100 hover:text-navy-900"}`;
  const btn = "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold";
  const outline = `${btn} border border-slate-300 bg-white text-navy-900 hover:bg-slate-50`;

  const actions = (
    <>
      <Link href="/hire" onClick={() => setOpen(false)} className={`${btn} bg-hire text-white hover:bg-orange-600`}>
        <Briefcase size={16} />Hire Me
      </Link>
      {staff && (
        <Link href="/admin" onClick={() => setOpen(false)} className={outline}>
          <LayoutDashboard size={16} />Dashboard
        </Link>
      )}
      {user ? (
        <form action={logout}>
          <button className={outline}><LogOut size={16} />Log out</button>
        </form>
      ) : (
        <Link href="/login" onClick={() => setOpen(false)} className={outline}>Login / Register</Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5">
        <Link href="/" aria-label="SaifulSir.com home" className="shrink-0">
          <Image src="/logo.png" alt="SaifulSir.com" width={689} height={245} priority className="h-10 w-auto sm:h-12" />
        </Link>
        <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-0.5 whitespace-nowrap xl:flex">
          {nav.map(([l, h]) => (
            <Link key={h} href={h} aria-current={on(h) ? "page" : undefined} className={desk(h)}>{l}</Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 xl:flex">{actions}</div>
        <button
          className="ml-auto rounded-md p-2 text-navy-900 hover:bg-slate-100 xl:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 xl:hidden">
          <nav aria-label="Mobile" className="grid gap-1">
            {nav.map(([l, h]) => (
              <Link key={h} href={h} onClick={() => setOpen(false)} aria-current={on(h) ? "page" : undefined}
                className={`rounded-md px-3 py-2.5 font-medium ${on(h) ? "bg-blue-50 text-royal" : "text-slate-700 hover:bg-slate-100"}`}>{l}</Link>
            ))}
          </nav>
          {user?.name && <p className="mt-3 px-3 text-sm text-slate-500">Signed in as {user.name}</p>}
          <div className="mt-3 flex flex-wrap gap-2">{actions}</div>
        </div>
      )}
    </header>
  );
}