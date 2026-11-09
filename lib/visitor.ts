import { db } from "@/lib/db";

// টাইমজোন: Asia/Dhaka (বাংলাদেশ)
// সার্ভার যেখানেই থাকুক, আমরা সবসময় ঢাকার সময় হিসেবে হিসাব করব।

export function getDhakaStartOfDay(date = new Date()): Date {
  const dhakaStr = date.toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
  const dhakaDate = new Date(dhakaStr);
  // UTC তে কনভার্ট করে ফেরত দিই যাতে Prisma সঠিকভাবে তুলনা করতে পারে
  return new Date(Date.UTC(dhakaDate.getFullYear(), dhakaDate.getMonth(), dhakaDate.getDate()));
}

export function getDhakaStartOfWeek(date = new Date()): Date {
  const start = getDhakaStartOfDay(date);
  const day = start.getUTCDay(); // 0 = Sunday
  // বাংলাদেশে সপ্তাহ শুরু শনিবার (Saturday = 6)
  const diff = (day + 1) % 7;
  start.setUTCDate(start.getUTCDate() - diff);
  return start;
}

export function getDhakaStartOfMonth(date = new Date()): Date {
  const start = getDhakaStartOfDay(date);
  start.setUTCDate(1);
  return start;
}

export function getDhakaStartOfYear(date = new Date()): Date {
  const start = getDhakaStartOfDay(date);
  start.setUTCMonth(0);
  start.setUTCDate(1);
  return start;
}

// ভিজিটর লগ করার ফাংশন (API track route থেকে ডাকা হবে)
export async function trackVisit(opts: {
  path: string;
  ipHash?: string;
  uaHash?: string;
  country?: string;
}) {
  const now = new Date();
  const dayStart = getDhakaStartOfDay(now);

  try {
    // ১. প্রতিটা হিট VisitLog-এ সেভ করি
    await db.visitLog.create({
      data: {
        path: opts.path,
        ipHash: opts.ipHash ?? null,
        uaHash: opts.uaHash ?? null,
        country: opts.country ?? "",
        createdAt: now,
      },
    });

    // ২. DailyStat-এ আজকের সংখ্যা বাড়াই (upsert দিয়ে)
    await db.dailyStat.upsert({
      where: { date: dayStart },
      create: { date: dayStart, views: 1, uniques: 1 },
      update: { views: { increment: 1 } },
    });
  } catch (e) {
    // কোনো কারণে DB এラー হলে সাইট ভাঙবে না
    console.error("trackVisit failed:", e);
  }
}

// ড্যাশবোর্ডের জন্য সব সংখ্যা বের করার ফাংশন
export async function getVisitorStats() {
  const now = new Date();
  const dayStart = getDhakaStartOfDay(now);
  const weekStart = getDhakaStartOfWeek(now);
  const monthStart = getDhakaStartOfMonth(now);
  const yearStart = getDhakaStartOfYear(now);

  try {
    // সব সময়ের মোট (DailyStat এর views যোগ)
    const totalAgg = await db.dailyStat.aggregate({
      _sum: { views: true },
    });

    const [today, week, month, year] = await Promise.all([
      db.dailyStat.aggregate({
        where: { date: { gte: dayStart } },
        _sum: { views: true },
      }),
      db.dailyStat.aggregate({
        where: { date: { gte: weekStart } },
        _sum: { views: true },
      }),
      db.dailyStat.aggregate({
        where: { date: { gte: monthStart } },
        _sum: { views: true },
      }),
      db.dailyStat.aggregate({
        where: { date: { gte: yearStart } },
        _sum: { views: true },
      }),
    ]);

    return {
      total: totalAgg._sum.views ?? 0,
      today: today._sum.views ?? 0,
      week: week._sum.views ?? 0,
      month: month._sum.views ?? 0,
      year: year._sum.views ?? 0,
      ok: true,
    };
  } catch (e) {
    console.error("getVisitorStats failed:", e);
    // টেবিল না থাকলে বা DB error হলে সব 0 দেখাবে, সাইট ভাঙবে না
    return {
      total: 0,
      today: 0,
      week: 0,
      month: 0,
      year: 0,
      ok: false,
    };
  }
}
