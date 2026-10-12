import HireForm from "@/components/hire-form";
const stack = ["Next.js", "TypeScript", "Tailwind", "Prisma", "PostgreSQL", "Flutter", "Google Apps Script", "AppSheet"];
const services = ["School and coaching management systems", "Bengali educational web tools", "Course and result portals", "Print and PDF document generators"];
export default function Hire() {
  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-2">
      <section>
        <h1 className="text-3xl font-bold">Saiful Islam, web developer</h1>
        <p className="mt-3 text-slate-600">I build education software for Bangladeshi schools, coaching centers and exam-prep sites.</p>
        <div className="mt-5 flex flex-wrap gap-2">{stack.map((s) => <span key={s} className="rounded-full bg-navy-900 px-3 py-1 text-sm text-white">{s}</span>)}</div>
        <h2 className="mt-8 font-semibold">Services</h2>
        <ul className="mt-2 list-disc pl-5 text-slate-700">{services.map((s) => <li key={s}>{s}</li>)}</ul>
      </section>
      <section className="rounded-xl bg-white p-6 shadow"><h2 className="mb-4 text-xl font-bold">Tell me about your project</h2><HireForm /></section>
    </main>
  );
}
