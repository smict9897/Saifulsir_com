import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Jobs() {
  const jobs = await db.job.findMany({ orderBy: { deadline: "asc" } }).catch(() => []);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Job circulars</h1>
      {jobs.length === 0 && <p className="mt-6 text-slate-600">No circulars yet. Check back soon.</p>}
      <ul className="mt-6 grid gap-3">
        {jobs.map((j) => (
          <li key={j.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-royal">{j.type}</p>
            <h2 className="font-semibold">{j.title}</h2>
            <p className="text-sm text-slate-600">{j.org}{j.deadline && ` · Deadline ${j.deadline.toLocaleDateString("en-GB")}`}</p>
            {j.url && <a href={j.url} className="mt-2 inline-block text-sm text-royal underline" rel="noopener noreferrer" target="_blank">View circular</a>}
          </li>
        ))}
      </ul>
    </main>
  );
}
