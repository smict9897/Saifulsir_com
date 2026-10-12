import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await db.resource.findUnique({ where: { id: (await params).id } });
  if (!r) return new NextResponse("Not found", { status: 404 });
  if (r.priceBdt > 0) {
    const u = (await auth())?.user;
    if (!u?.id) return NextResponse.redirect(new URL("/login", req.url));
    const ok = u.role === "ADMIN" || u.role === "TEACHER" || (await db.purchase.findFirst({ where: { userId: u.id, resourceId: r.id, status: "PAID" } }));
    if (!ok) return new NextResponse("Buy this material first.", { status: 402 });
  }
  await db.resource.update({ where: { id: r.id }, data: { downloads: { increment: 1 } } });
  return NextResponse.redirect(r.fileUrl);
}
