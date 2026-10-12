import Link from "next/link";
import { BookOpen, GraduationCap, Briefcase, School, Download } from "lucide-react";
import { db } from "@/lib/db";
import QuizBox from "@/components/quiz-box";

const cats = [
  { t: "Academic Notes", d: "Class 6–12, SSC, HSC lecture sheets and board questions", i: BookOpen, h: "/academic" },
  { t: "University Admission", d: "Unit-wise preparation and solved question bank", i: GraduationCap, h: "/admission" },
  { t: "NTRCA & Teacher Hub", d: "Preliminary, written and viva handouts", i: School, h: "/ntrca" },
  { t: "Job Circular & Prep", d: "Live govt, bank and private job feed", i: Briefcase, h: "/jobs" },
];
export default async function Home() {
  const quotes = await db.testimonial.findMany({ orderBy: { createdAt: "desc" }, take: 3 }).catch(() => []);
  const items = await db.resource.findMany({ orderBy: { createdAt: "desc" }, take: 4 }).catch(() => []);
  return (
    <main>
      <section className="bg-navy-900 text-white">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-16 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold leading-tight lg:text-5xl">শিক্ষার সব আয়োজন ও ক্যারিয়ার প্রস্তুতি এক প্ল্যাটফর্মে</h1>
            <p className="mt-4 max-w-prose text-slate-300">Free notes, board questions, model tests and AI-made practice quizzes for students and job seekers.</p>
            <Link href="/academic" className="mt-8 inline-flex items-center gap-2 rounded-md bg-royal px-5 py-3 font-semibold"><Download size={18} />Free Notes Download</Link>
          </div>
          <QuizBox />
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 pt-14 sm:grid-cols-2 lg:grid-cols-4">
        {cats.map(({ t, d, i: Icon, h }) => (
          <Link key={t} href={h} className="rounded-lg border border-slate-200 bg-white p-5 hover:border-royal">
            <Icon className="text-royal" /><h2 className="mt-3 font-semibold">{t}</h2><p className="mt-1 text-sm text-slate-600">{d}</p>
          </Link>
        ))}
      </section>
      <section className="mx-auto mt-14 max-w-6xl px-4">
        <h2 className="text-2xl font-bold">Latest materials</h2>
        {items.length === 0 && <p className="mt-3 text-slate-600">Materials will appear here after the first upload.</p>}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map((r) => (
          <a key={r.id} href={`/api/download/${r.id}`} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-royal">
            <p className="text-sm text-royal">{r.category}</p><p className="mt-1 font-semibold">{r.title}</p><p className="mt-2 text-sm text-slate-600">{r.priceBdt > 0 ? `৳${r.priceBdt}` : "Free"}</p>
          </a>))}</div>
      </section>
      <section className="mx-auto mt-14 max-w-6xl px-4">
        <div className="rounded-lg bg-navy-800 p-8 text-white"><h2 className="text-2xl font-bold">Practice with AI</h2><p className="mt-1 text-slate-300">Pick a topic and get a fresh quiz with Bangla explanations.</p>
          <Link href="/quiz" className="mt-4 inline-block rounded-md bg-royal px-5 py-3 font-semibold">Start a practice quiz</Link></div>
      </section>
      {quotes.length > 0 && (
        <section className="mx-auto mt-14 max-w-6xl px-4">
          <h2 className="text-2xl font-bold">What students say</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">{quotes.map((q) => (
            <figure key={q.id} className="rounded-lg border border-slate-200 bg-white p-5"><blockquote>{q.quote}</blockquote>
              <figcaption className="mt-3 text-sm text-slate-600">{q.name}{q.role && `, ${q.role}`}</figcaption></figure>))}</div>
        </section>
      )}
      <section className="mx-auto mt-14 max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-hire p-8 text-white">
          <div><h2 className="text-2xl font-bold">Need a web developer?</h2><p>Hire Saiful Islam for your next project.</p></div>
          <Link href="/hire" className="rounded-md bg-white px-5 py-3 font-semibold text-navy-900">See portfolio</Link>
        </div>
      </section>
    </main>
  );
}
