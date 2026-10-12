import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Page() {
  const list = await db.inquiry.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-4 text-2xl font-bold">Hire Me inquiries</h1>
      {list.length === 0 && <p className="text-slate-600">No inquiries yet.</p>}
      <ul className="grid gap-3">{list.map((i) => (
        <li key={i.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="font-semibold">{i.name} · <a className="text-royal" href={`mailto:${i.email}`}>{i.email}</a></p>
          {i.budget && <p className="text-sm text-slate-600">Budget: {i.budget}</p>}
          <p className="mt-2 whitespace-pre-wrap text-sm">{i.message}</p>
        </li>))}
      </ul>
    </main>
  );
}
