import type { Metadata } from "next";
import GpaCalculator from "@/components/tools/gpa-calculator";
export const metadata: Metadata = {
  title: "জিপিএ ক্যালকুলেটর (৪র্থ বিষয়সহ)",
  description: "নম্বর থেকে GPA বের করুন, ৪র্থ বিষয়সহ। SSC ও HSC এর জন্য আনুমানিক হিসাব।",
  alternates: { canonical: "/tools/gpa" },
};
export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">জিপিএ ক্যালকুলেটর (৪র্থ বিষয়সহ)</h1>
      <div className="mt-6"><GpaCalculator /></div>
    </main>
  );
}
