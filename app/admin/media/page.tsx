import { list } from "@vercel/blob";
import MediaUpload from "@/components/media-upload";
export const dynamic = "force-dynamic";

export default async function Page() {
  let items: { url: string; pathname: string }[] = [];
  try { items = (await list({ prefix: "media/", limit: 30 })).blobs.map((b) => ({ url: b.url, pathname: b.pathname })); } catch {}
  return (
    <div className="grid gap-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold">Media</h1>
        <p className="mb-4 text-sm text-slate-600">Upload an image, then paste the line you get into your post text. Use a short alt text that describes the picture.</p>
        <MediaUpload />
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Recent uploads</h2>
        {items.length === 0 && <p className="text-sm text-slate-600">Nothing uploaded yet.</p>}
        <div className="grid gap-3 sm:grid-cols-3">
          {items.map((i) => (
            <div key={i.url} className="text-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.url} alt="" loading="lazy" className="aspect-video w-full rounded-lg object-cover" />
              <p className="mt-1 break-all text-slate-500">{i.url}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
