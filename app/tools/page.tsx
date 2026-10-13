import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, Crop, FileText, GraduationCap } from "lucide-react";
export const metadata: Metadata = {
  title: "শিক্ষার্থী টুলস",
  description: "জিপিএ ক্যালকুলেটর, NU CGPA, কভার পেজ মেকার আর ছবি ও স্বাক্ষর রিসাইজার, বিনামূল্যে।",
  alternates: { canonical: "/tools" },
};
const tools = [
  ["জিপিএ ক্যালকুলেটর", "৪র্থ বিষয়সহ SSC/HSC", "/tools/gpa", Calculator, "bg-emerald-100 text-emerald-600"],
  ["NU CGPA", "ক্রেডিট ও গ্রেড দিয়ে", "/tools/nu-cgpa", GraduationCap, "bg-indigo-100 text-indigo-600"],
  ["কভার পেজ মেকার", "অ্যাসাইনমেন্টের জন্য", "/tools/cover-page", FileText, "bg-violet-100 text-violet-600"],
  ["ছবি ও স্বাক্ষর রিসাইজার", "চাকরির আবেদনের জন্য", "/tools/photo-resizer", Crop, "bg-sky-100 text-sky-600"],
] as const;
export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">শিক্ষার্থী টুলস</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {tools.map(([t, d, h, Icon, c]) => (
          <Link key={h} href={h} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-royal">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c}`}><Icon size={22} /></span>
            <span><span className="block font-semibold">{t}</span><span className="block text-sm text-slate-500">{d}</span></span>
          </Link>
        ))}
      </div>
    </main>
  );
}
