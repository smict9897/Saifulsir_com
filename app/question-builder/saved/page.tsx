import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listPapers } from "@/app/actions/qb-papers";
import QbSavedList from "@/components/qb-saved-list";

export const dynamic = "force-dynamic";
export const metadata = { title: "সেভ করা প্রশ্নপত্র" };

export default async function SavedPapers() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "TEACHER") redirect("/");
  const papers = await listPapers();

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <Link href="/question-builder" className="text-sm text-blue-600">‹ প্রশ্নপত্র তৈরি করুন</Link>
      <h1 className="mt-2 text-2xl font-bold">সেভ করা প্রশ্নপত্র</h1>
      <QbSavedList papers={papers} />
    </main>
  );
}
