import { createTest } from "@/app/actions/tests";
const f = "rounded-md border border-slate-300 p-2";
export default function Page() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Create model test</h1>
      <p className="mb-4 text-sm text-slate-600">Questions are picked at random from approved questions of the subject.</p>
      <form action={createTest} className="grid gap-3">
        <input name="title" required className={f} placeholder="Test title" />
        <input name="subject" required className={f} placeholder="Subject (same spelling as saved questions)" />
        <input name="count" type="number" min={5} max={100} defaultValue={20} className={f} aria-label="Number of questions" />
        <input name="minutes" type="number" min={1} defaultValue={20} className={f} aria-label="Minutes" />
        <button className="rounded-md bg-royal px-4 py-2 text-white">Create test</button>
      </form>
    </main>
  );
}
