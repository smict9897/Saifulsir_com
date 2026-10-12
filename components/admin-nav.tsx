"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles, FileUp, ListChecks, Briefcase, Megaphone, Newspaper, Quote, Mail, Pencil, Globe } from "lucide-react";

const items = [
  ["Overview", "/admin", LayoutDashboard], ["AI Questions", "/admin/ai", Sparkles], ["Materials & Videos", "/admin/pdf", FileUp],
  ["Model Tests", "/admin/tests", ListChecks], ["Job Circulars", "/admin/jobs", Briefcase], ["Notices", "/admin/notices", Megaphone],
  ["Blog", "/admin/blog", Newspaper], ["Testimonials", "/admin/testimonials", Quote], ["Inquiries", "/admin/inquiries", Mail],
  ["Edit / Delete", "/admin/manage", Pencil],
] as const;

export default function AdminNav({ name, role }: { name: string; role?: string }) {
  const path = usePathname();
  const on = (h: string) => (h === "/admin" ? path === h : path.startsWith(h));
  return (
    <aside className="shrink-0 lg:w-64">
      <div className="rounded-2xl bg-white p-3 shadow-sm lg:sticky lg:top-20">
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
          {items.map(([l, h, Icon]) => (
            <Link key={h} href={h} aria-current={on(h) ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${on(h) ? "bg-royal text-white shadow" : "text-slate-700 hover:bg-slate-100"}`}>
              <Icon size={18} />{l}
            </Link>
          ))}
        </nav>
        <div className="mt-3 hidden border-t border-slate-200 pt-3 lg:block">
          <Link href="/" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"><Globe size={18} />View website</Link>
          <p className="mt-2 px-3 text-sm font-semibold">{name}</p>
          <p className="px-3 text-xs text-slate-500">{role === "ADMIN" ? "Administrator" : "Teacher"}</p>
        </div>
      </div>
    </aside>
  );
}