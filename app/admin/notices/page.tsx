import { addNotice } from "@/app/actions/content";
export default function Page() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-4 text-2xl font-bold">Ticker notice</h1>
      <form action={addNotice} className="grid gap-3">
        <textarea name="text" required minLength={3} className="rounded-md border border-slate-300 p-2" placeholder="Text shown in the top bar" />
        <button className="rounded-md bg-royal px-4 py-2 text-white">Publish notice</button>
      </form>
    </main>
  );
}
