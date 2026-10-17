import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, LogOut, PlusCircle, BookOpenCheck } from "lucide-react";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import TeacherOnboarding from "@/components/teacher-onboarding";

export const dynamic = "force-dynamic";
export const metadata = { title: "ড্যাশবোর্ড" };

async function logout() {
  "use server";
  await signOut({ redirectTo: "/" });
}

function greeting() {
  const h = Number(
    new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Dhaka" }).format(new Date())
  ) % 24;
  if (h >= 5 && h < 12) return "সুপ্রভাত,";
  if (h >= 12 && h < 16) return "শুভ দুপুর,";
  if (h >= 16 && h < 18) return "শুভ অপরাহ্ন,";
  if (h >= 18 && h < 20) return "শুভ সন্ধ্যা,";
  return "শুভ রাত্রি,";
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ skip?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) redirect("/teacher/login");

  const user = await db.user.findUnique({ where: { email } });
  if (!user)
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <p>অ্যাকাউন্ট পাওয়া যায়নি। লগআউট করে আবার ঢুকুন।</p>
        <form action={logout} className="mt-4">
          <button className="rounded-xl bg-slate-800 px-4 py-2 text-white">লগআউট</button>
        </form>
      </main>
    );

  const [profile, bankCount] = await Promise.all([
    db.teacherProfile.findUnique({ where: { userId: user.id } }).catch(() => null),
    db.question.count({ where: { approved: true } }).catch(() => 0),
  ]);

  const showForm = sp.edit === "1" || (!profile && sp.skip !== "1");
  if (showForm) {
    return (
      <TeacherOnboarding
        canSkip={!profile}
        defaults={{
          institution: profile?.institution ?? "",
          division: profile?.division ?? "",
          district: profile?.district ?? "",
          upazila: profile?.upazila ?? "",
          phone: profile?.phone ?? "",
          address: profile?.address ?? "",
        }}
      />
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-bold text-emerald-700">SaifulSir.com</Link>
        <form action={logout}>
          <button aria-label="লগআউট" className="rounded-xl border border-slate-300 p-2.5"><LogOut size={20} /></button>
        </form>
      </div>

      <section className="mt-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 text-white">
        <p className="text-sm text-slate-300">{greeting()}</p>
        <h1 className="mt-1 text-3xl font-bold">{user.name ?? "শিক্ষক"}</h1>

        <Link
          href="/dashboard?edit=1"
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1.5 text-sm"
        >
          <Building2 size={16} />
          {profile ? profile.institution : "প্রতিষ্ঠান সেট করা হয়নি"}
        </Link>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/question-builder" className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold">
            <PlusCircle size={20} /> প্রশ্ন তৈরি করুন
          </Link>
          <Link href="/quiz" className="flex items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 font-semibold text-slate-900">
            <BookOpenCheck size={20} /> কুইজ প্র্যাকটিস
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-2xl font-bold text-emerald-300">{bankCount}</p>
            <p className="text-xs text-slate-300">প্রশ্নভান্ডারে প্রশ্ন</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-2xl font-bold">ফ্রি</p>
            <p className="text-xs text-slate-300">প্ল্যান</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-2xl font-bold">{profile ? "শিক্ষক" : "—"}</p>
            <p className="text-xs text-slate-300">পরিচয়</p>
          </div>
        </div>
      </section>

      <Link href="/question-builder" className="mt-5 block rounded-3xl border-2 border-emerald-200 bg-white p-6">
        <h2 className="text-xl font-bold">প্রশ্নপত্র তৈরি করুন</h2>
        <p className="mt-1 text-sm text-slate-600">শ্রেণি ও বিষয় বেছে প্রশ্ন নির্বাচন করুন, তারপর PDF করুন</p>
        <span className="mt-3 inline-block font-semibold text-emerald-700">শুরু করুন →</span>
      </Link>

      <div className="mt-5 rounded-3xl border border-dashed border-slate-300 p-6 text-slate-500">
        <p className="font-semibold">সেভ করা প্রশ্নপত্র</p>
        <p className="text-sm">শীঘ্রই আসছে</p>
      </div>
    </main>
  );
}
