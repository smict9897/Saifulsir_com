import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Hind_Siliguri } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import SiteHeader from "@/components/site-header";

const bn = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-bn" });
export const metadata: Metadata = { title: "SaifulSir.com", description: "Academic notes, admission, NTRCA, jobs and AI practice quizzes." };

async function logout() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const n = await db.notice.findFirst({ where: { active: true }, orderBy: { createdAt: "desc" } }).catch(() => null);
  const notice = n?.text ?? "স্বাগতম SaifulSir.com এ";
  const u = (await auth())?.user;
  const quick = [["Academic Notes", "/academic"], ["Admission", "/admission"], ["NTRCA", "/ntrca"], ["Jobs", "/jobs"]];
  const more = [["Blog", "/blog"], ["Hire Me", "/hire"], ["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]];
  return (
    <html lang="bn" className={bn.variable}>
      <body className="font-sans">
        <div className="flex items-center bg-navy-900 text-sm text-white">
          <span className="shrink-0 bg-hire px-3 py-1.5 font-semibold">নোটিশ</span>
          <div className="min-w-0 flex-1 overflow-hidden py-1.5"><p className="ticker whitespace-nowrap">{notice}</p></div>
        </div>
        <SiteHeader user={u ? { name: u.name, role: u.role } : null} logout={logout} />
        {children}
        <footer className="mt-20 bg-navy-900 text-sm text-slate-300">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
            <div>
              <p className="text-lg font-bold text-white">SaifulSir.com</p>
              <p className="mt-2 max-w-xs">শিক্ষার সবকিছু একসাথে। নোট, প্রশ্নব্যাংক, মডেল টেস্ট আর AI কুইজ।</p>
            </div>
            <div>
              <p className="font-semibold text-white">Quick links</p>
              <ul className="mt-3 grid gap-2">{quick.map(([l, h]) => <li key={h}><Link href={h} className="hover:text-white">{l}</Link></li>)}</ul>
            </div>
            <div>
              <p className="font-semibold text-white">More</p>
              <ul className="mt-3 grid gap-2">{more.map(([l, h]) => <li key={h}><Link href={h} className="hover:text-white">{l}</Link></li>)}</ul>
            </div>
          </div>
          <div className="border-t border-white/10 py-4 text-center text-xs">© {new Date().getFullYear()} SaifulSir.com</div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}