import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.ids)
    ? body.ids.filter((x: unknown) => typeof x === "string").slice(0, 200)
    : [];
  if (!ids.length) return NextResponse.json({ items: [] });

  const rows = await db.question.findMany({ where: { id: { in: ids }, approved: true } });
  const map = new Map(rows.map((r) => [r.id, r]));

  const items = ids.flatMap((id) => {
    const r = map.get(id);
    return r
      ? [{
          id: r.id,
          text: r.text,
          options: r.options as Record<string, string>,
          correct: r.correct,
          explanation: r.explanation,
          category: r.category,
          subject: r.subject,
          topic: r.topic,
          source: r.source,
        }]
      : [];
  });
  return NextResponse.json({ items });
}
