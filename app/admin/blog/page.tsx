import { addPost } from "@/app/actions/manage";
const f = "rounded-md border border-slate-300 p-2";
export default function Page() {
  return (<main className="mx-auto max-w-2xl px-4 py-10"><h1 className="mb-4 text-2xl font-bold">Write blog post</h1>
    <form action={addPost} className="grid gap-3"><input name="title" required className={f} placeholder="Title" />
      <textarea name="body" required minLength={20} rows={12} className={f} placeholder="Post text. Leave a blank line between paragraphs." />
      <button className="rounded-md bg-royal px-4 py-2 text-white">Publish post</button></form></main>);
}
