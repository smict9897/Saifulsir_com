import Image from "next/image";
import type { Metadata } from "next";
import HireForm from "@/components/hire-form";
import PortfolioShell from "@/components/portfolio-shell";

export const metadata: Metadata = {
  title: "Hire Me | Saiful Islam",
  description:
    "Saiful Islam builds school and coaching management systems, Bengali-language educational tools and full-stack web apps.",
};

const services = [
  {
    icon: "🏫",
    title: "School & coaching management",
    text: "Results portals, fee and batch tracking, admission and document generators built around Bangladesh academic standards.",
  },
  {
    icon: "📚",
    title: "Bengali educational tools",
    text: "Quiz generators, exam-prep sites and LMS-style course platforms that work well in Bengali.",
  },
  {
    icon: "⚙️",
    title: "Web apps & automation",
    text: "Next.js and Flutter apps, plus Google Apps Script and AppSheet workflows that remove repetitive work.",
  },
];

const skills = [
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "JavaScript",
  "Flutter",
  "PHP",
  "MySQL",
  "HTML & CSS",
  "Google Apps Script",
  "AppSheet",
];

// href is optional: add the live link when you have it.
const projects: { name: string; stack: string; text: string; href?: string }[] = [
  {
    name: "Saifulsir.com",
    stack: "Next.js | TypeScript | Tailwind",
    text: "EdTech platform and job portal with an AI quiz generator and an admin CMS.",
    href: "https://saifulsir.com",
  },
  {
    name: "PBM – Private Batch Management",
    stack: "Flutter",
    text: "Offline-first batch and fee management app for tutors and coaching centers, with SSLCommerz payments.",
  },
  {
    name: "EduResult Dashboard",
    stack: "HTML | CSS | JS",
    text: "Results dashboard for S.N.P. High School & College using Bangladesh Board grading.",
  },
  {
    name: "Bengali Notice Maker",
    stack: "HTML | CSS | JS",
    text: "Single-file web app that creates print-ready notices in Bengali.",
  },
  {
    name: "NTRCA Academy",
    stack: "Web | LMS",
    text: "NTRCA exam-preparation sites and a course marketplace in Bengali.",
  },
  {
    name: "SkillzUp",
    stack: "PHP | MySQL",
    text: "Mobile-first course-selling platform with an admin panel and online payments.",
  },
];

function SectionHead({ pill, title, sub }: { pill: string; title: string; sub?: string }) {
  return (
    <div className="mb-10 text-center">
      <span className="inline-block rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs text-[#415de6]">
        {pill}
      </span>
      <h2 className="mt-3 bg-gradient-to-r from-[#e64157] to-[#415de6] bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
        {title}
      </h2>
      {sub && <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">{sub}</p>}
    </div>
  );
}

const card = "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6";
const gradientBtn =
  "inline-block rounded-full bg-gradient-to-r from-[#e64157] to-[#415de6] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90";

export default function Hire() {
  return (
    <PortfolioShell>
      <main>
        {/* Hero */}
        <section id="hero" className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-xl text-[var(--muted)]">Hello, I&apos;m</p>
            <h1 className="mt-1 bg-gradient-to-r from-[#e64157] to-[#415de6] bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
              Saiful Islam
            </h1>
            <span className="mt-4 inline-block rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-sm">
              ✨ Full-stack Developer
            </span>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
              I build school management systems, Bengali-language educational tools and web apps for
              teachers, institutions and learners in Bangladesh.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#contact" className={gradientBtn}>
                Hire me
              </a>
              <a
                href="#projects"
                className="inline-block rounded-full border border-[var(--border)] px-6 py-2.5 text-sm font-medium"
              >
                View portfolio
              </a>
            </div>
          </div>
          <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-[#e64157] to-[#415de6] p-1 md:h-72 md:w-72">
            <Image
              src="/images/saiful.jpg"
              alt="Saiful Islam"
              width={288}
              height={288}
              priority
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </section>

        {/* Services */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <SectionHead pill="What I do" title="Services" />
          <div className="grid gap-5 md:grid-cols-3">
            {services.map((s) => (
              <div key={s.title} className={card}>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#e64157] to-[#415de6] text-xl">
                  {s.icon}
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section id="about" className="mx-auto max-w-4xl px-4 py-16">
          <SectionHead pill="But who am I?" title="About Me" />
          <div className={`${card} space-y-4 leading-relaxed text-[var(--muted)]`}>
            <p>
              I&apos;m a developer based in Bangladesh with a Diploma and a B.Sc. in Computer Science and
              Engineering. I design and build complete products: layout, data storage, print and PDF
              output, and the grading and document standards Bangladeshi institutions actually use.
            </p>
            <p>
              I&apos;ve also worked as an AI Voice Evaluator and S2S Contributor, scoring Bengali speech
              quality, writing prompts and doing QA, so I pay close attention to how Bengali reads and
              sounds in software.
            </p>
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="mx-auto max-w-5xl px-4 py-16">
          <SectionHead pill="What do I know?" title="Skills" sub="The technologies I work with." />
          <ul className="flex flex-wrap justify-center gap-3">
            {skills.map((s) => (
              <li key={s} className="rounded-full border border-[var(--border)] bg-[var(--card)] px-5 py-2 text-sm">
                {s}
              </li>
            ))}
          </ul>
        </section>

        {/* Projects */}
        <section id="projects" className="mx-auto max-w-6xl px-4 py-16">
          <SectionHead pill="What I've done" title="Projects" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <article key={p.name} className={`${card} flex flex-col`}>
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 text-xs text-[#415de6]">{p.stack}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">{p.text}</p>
                {p.href && (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 self-start rounded-full bg-gradient-to-r from-[#e64157] to-[#415de6] px-4 py-1.5 text-xs font-medium text-white"
                  >
                    Visit ↗
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mx-auto max-w-3xl px-4 py-16">
          <SectionHead
            pill="What's next?"
            title="Get In Touch"
            sub="Need a school system, a Bengali learning tool or a custom web app? Tell me what you need."
          />
          <div className="rounded-xl bg-white p-6 text-slate-800 shadow-sm">
            <HireForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-6 text-center text-sm text-[var(--muted)]">
        Made with Next.js, TypeScript and Tailwind by Saiful Islam. Layout inspired by Vijay Singh&apos;s
        open-source portfolio template.
      </footer>
    </PortfolioShell>
  );
}
