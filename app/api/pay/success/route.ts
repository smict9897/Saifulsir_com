import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validate } from "@/lib/ssl";
export async function POST(req: Request) {
  const fd = await req.formData(), base = process.env.SITE_URL!;
  const tran = String(fd.get("tran_id") ?? ""), p = await db.purchase.findUnique({ where: { id: tran } });
  if (!p) return NextResponse.redirect(`${base}/`, 303);
  const v = await validate(String(fd.get("val_id") ?? ""));
  const ok = v && (v.status === "VALID" || v.status === "VALIDATED") && v.tran_id === tran && v.currency === "BDT" && Math.round(Number(v.amount)) === p.amount;
  await db.purchase.update({ where: { id: tran }, data: { status: ok ? "PAID" : "FAILED" } });
  return NextResponse.redirect(ok ? `${base}/api/download/${p.resourceId}` : `${base}/library?error=payment`, 303);
}
