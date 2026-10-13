import type { Metadata } from "next";
import CoverPage from "@/components/tools/cover-page";
export const metadata: Metadata = {
  title: "অ্যাসাইনমেন্ট কভার পেজ মেকার",
  description: "তথ্য বসিয়ে অ্যাসাইনমেন্টের কভার পেজ বানান আর PDF করুন।",
  alternates: { canonical: "/tools/cover-page" },
};
export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">অ্যাসাইনমেন্ট কভার পেজ মেকার</h1>
      <div className="mt-6"><CoverPage /></div>
    </main>
  );
}
