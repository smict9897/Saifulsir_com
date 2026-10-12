import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Videos() {
  const items = await db.resource.findMany({ where: { category: "Video" }, orderBy: { createdAt: "desc" } }).catch(() => []);
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Video lessons</h1>
      {items.length === 0 && <p className="mt-6 text-slate-600">No videos yet.</p>}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">{items.map((v) => {
        const id = v.fileUrl.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1];
        return (<div key={v.id}><h2 className="mb-2 font-semibold">{v.title}</h2>
          {id ? <iframe className="aspect-video w-full rounded-lg" src={`https://www.youtube.com/embed/${id}`} title={v.title} allowFullScreen /> : <a className="text-royal underline" href={v.fileUrl}>Open video</a>}</div>);
      })}</div>
    </main>
  );
}
