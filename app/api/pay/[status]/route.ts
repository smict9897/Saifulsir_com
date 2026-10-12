import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function POST(req: Request) {
  const tran = String((await req.formData()).get("tran_id") ?? "");
  await db.purchase.updateMany({ where: { id: tran, status: "PENDING" }, data: { status: "FAILED" } });
  return NextResponse.redirect(`${process.env.SITE_URL}/library?error=payment`, 303);
}
