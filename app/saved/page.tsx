import type { Metadata } from "next";
import SavedList from "@/components/saved-list";
export const metadata: Metadata = { title: "সংরক্ষিত", robots: { index: false } };
export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">সংরক্ষিত বই ও পোস্ট</h1>
      <p className="mt-1 text-sm text-slate-500">এগুলো শুধু এই ব্রাউজারে জমা থাকে। ব্রাউজারের ডেটা মুছলে হারিয়ে যাবে।</p>
      <SavedList />
    </main>
  );
}
