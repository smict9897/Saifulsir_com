import QbBuilder from "@/components/qb-builder";

export const dynamic = "force-dynamic";
export const metadata = { title: "প্রশ্নপত্র বিল্ডার" };

export default function BuildPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <QbBuilder />
    </main>
  );
}
