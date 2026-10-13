import type { Metadata } from "next";
import PhotoResizer from "@/components/tools/photo-resizer";
export const metadata: Metadata = {
  title: "ছবি ও স্বাক্ষর রিসাইজার",
  description: "চাকরির আবেদনের জন্য ছবি ও স্বাক্ষরের মাপ আর সাইজ ঠিক করুন, ডিভাইসেই।",
  alternates: { canonical: "/tools/photo-resizer" },
};
export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">ছবি ও স্বাক্ষর রিসাইজার</h1>
      <div className="mt-6"><PhotoResizer /></div>
    </main>
  );
}
