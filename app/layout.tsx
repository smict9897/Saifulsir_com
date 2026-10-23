import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Tinos } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MessageCircle } from "lucide-react";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { getSite } from "@/lib/site";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import InstallPrompt from "@/components/InstallPrompt";
// app/layout.tsx এর <head> এর ভেতরে এটি যোগ করুন:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SaifulSir",
      "alternateName": ["SaifulSir.com", "Saiful Sir", "সাইফুল স্যার"],
      "url": "https://saifulsir.com",
      "description": "বাংলাদেশের স্মার্ট এডুকেশন প্ল্যাটফর্ম - নোট, সাজেশন ও অনলাইন পরীক্ষা",
      "publisher": {
        "@type": "Organization",
        "name": "SaifulSir.com",
        "url": "https://saifulsir.com",
        "logo": "https://saifulsir.com/logo.png"
      }
    }),
  }}
/>

<head>
  <script dangerouslySetInnerHTML={{ __html: themeScript }} />
  {/* 🎯 KaTeX গাণিতিক ফর্মুলার অফিসিয়াল স্টাইলশিট */}
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
    crossOrigin="anonymous"
  />
</head>
// 🎯 ১. আদর্শলিপিতে শুধুমাত্র বাংলা ইউনিকোড রেঞ্জ সীমাবদ্ধ করা হলো
const bn = localFont({
  src: "./fonts/AdorshoLipi.ttf",
  variable: "--font-bn",
  display: "swap",
  declarations: [
    {
      prop: "unicode-range",
      value: "U+0980-09FF, U+200C-200D", // শুধু বাংলা অক্ষর থাকলে এটি কাজ করবে
    },
  ],
});

// 🎯 ২. ইংরেজি ও গণিতের চিহ্নের জন্য Tinos (Times New Roman-এর হুবহু অফিশিয়াল সংস্করণ)
const en = Tinos({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-en",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    metadataBase: new URL(process.env.SITE_URL ?? "https://saifulsir.com"),
    // 🎯 এখানে ব্র্যান্ড নাম সহ টাইটেল আপডেট হলো:
    title: {
      default: "SaifulSir.com | Saifulsir - শিক্ষা ও পরীক্ষার পূর্ণাঙ্গ প্রস্তুতি",
      template: "%s | SaifulSir.com",
    },
    description: site.metaDescription,
    alternates: { types: { "application/rss+xml": "/feed.xml" } },
    icons: { apple: "/ceo-apple-touch-icon.png" },
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
    <html lang="bn" className={`${bn.variable} ${en.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className="pb-16 md:pb-0"
        style={{
          // 💡 প্রথমে ইংরেজি ফন্ট (Times New Roman / Tinos), এরপর বাংলা (AdorshoLipi)
          fontFamily: 'var(--font-en), "Times New Roman", var(--font-bn), serif',
        }}
      >
        <SiteHeader user={u ? { name: u.name, role: u.role } : null} logout={logout} notice={n?.text ?? "স্বাগতম SaifulSir.com এ"} />

        <main>{children}</main>

        <SiteFooter />

        {/* মোবাইলের নিচের স্মার্ট অ্যাপ বার */}
        <MobileBottomNav user={u ? { name: u.name, role: u.role } : null} />

        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg md:bottom-6 hover:scale-105 transition-transform"
          >
            <MessageCircle size={26} />
          </a>
        )}

        <InstallPrompt />
        <Analytics />
      </body>
    </html>
  );
}
