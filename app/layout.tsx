import "./globals.css";
import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MessageCircle } from "lucide-react";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { getSite } from "@/lib/site";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

const bn = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-bn" });

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    metadataBase: new URL(process.env.SITE_URL ?? "https://saifulsir.com"),
    title: { default: "SaifulSir.com", template: "%s | SaifulSir.com" },
    description: site.metaDescription,
    alternates: { types: { "application/rss+xml": "/feed.xml" } },
  };
}

const themeScript = "try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}";

async function logout() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [n, u, site] = await Promise.all([
    db.notice.findFirst({ where: { active: true }, orderBy: { createdAt: "desc" } }).catch(() => null),
    auth().then((s) => s?.user),
    getSite(),
  ]);
  const wa = site.social.find((s) => s.name === "WhatsApp")?.url;
  return (
    <html lang="bn" className={bn.variable} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="font-sans">
        <SiteHeader user={u ? { name: u.name, role: u.role } : null} logout={logout} notice={n?.text ?? "স্বাগতম SaifulSir.com এ"} />
        {children}
        <SiteFooter />
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
            className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg md:bottom-6">
            <MessageCircle size={26} />
          </a>
        )}
        <Analytics />
      </body>
    </html>
  );
}
