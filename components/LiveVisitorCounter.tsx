"use client";

import { useEffect, useState } from "react";

type Stats = {
  total: number;
  today: number;
  week: number;
  month: number;
  year: number;
  ok: boolean;
};

const DEFAULT_STATS: Stats = {
  total: 0,
  today: 0,
  week: 0,
  month: 0,
  year: 0,
  ok: false,
};

// ৭-সেগমেন্ট স্টাইলে এক-একটা ডিজিট
function DigitBox({ digit }: { digit: string }) {
  return (
    <div
      className="flex h-12 w-9 items-center justify-center rounded-md border border-emerald-700/40 bg-[#0a2a1c] text-2xl font-black text-[#f5d27a] shadow-[inset_0_0_10px_rgba(0,255,150,0.15)]"
      style={{
        textShadow: "0 0 6px rgba(245,210,122,0.7)",
        fontFamily: "monospace",
      }}
    >
      {digit}
    </div>
  );
}

function SegmentedNumber({ value }: { value: number }) {
  const str = String(value).padStart(6, "0").slice(-6);
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {str.split("").map((d, i) => (
        <DigitBox key={i} digit={d} />
      ))}
    </div>
  );
}

function StatRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
      <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-0.5 text-sm font-bold text-emerald-700">
        {value.toLocaleString("en-US")}
      </span>
    </div>
  );
}

export default function LiveVisitorCounter() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const res = await fetch("/api/visitor-stats", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          setStats(data);
          setLoading(false);
        }
      } catch (e) {
        console.error("Fetch stats failed:", e);
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    const t = setInterval(fetchStats, 10000); // ১০ সেকেন্ড পরপর আপডেট

    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* হেডার */}
      <div className="relative flex items-center justify-between bg-gradient-to-r from-[#06261a] via-[#0a3423] to-[#06261a] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#c9a94a]/50 bg-[#0a3423]">
            {/* ছোট চার্ট আইকন */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f5d27a"
              strokeWidth="2.5"
              className="h-5 w-5"
            >
              <path d="M4 20V10M10 20V4M16 20v-6M22 20H2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold leading-tight text-white">
              Page View Counter
            </h3>
            <p className="text-xs font-medium text-[#9be0b8]">
              Real-Time Analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-900/40 px-3 py-1">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-[11px] font-bold tracking-wider text-emerald-300">
            LIVE
          </span>
        </div>

        {/* নিচের সোনালি লাইন */}
        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#c9a94a] to-transparent" />
      </div>

      {/* বডি */}
      <div className="space-y-6 bg-white px-4 py-6">
        {/* TOTAL PAGE VIEWS */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Total Page Views
          </p>
          {loading ? (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-12 w-9 animate-pulse rounded-md bg-slate-200"
                />
              ))}
            </div>
          ) : (
            <SegmentedNumber value={stats.total} />
          )}
        </div>

        {/* স্ট্যাট লিস্ট */}
        <div className="space-y-2.5">
          <StatRow color="#10b981" label="Today" value={stats.today} />
          <StatRow color="#3b82f6" label="This Week" value={stats.week} />
          <StatRow color="#a855f7" label="This Month" value={stats.month} />
          <StatRow color="#f59e0b" label="This Year" value={stats.year} />
        </div>
      </div>
    </div>
  );
}
