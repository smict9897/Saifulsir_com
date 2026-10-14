import { db } from "@/lib/db";
export const dynamic = "force-dynamic";

export default async function Page() {
  const orders = await db.purchase.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const [users, items] = await Promise.all([
    db.user.findMany({ where: { id: { in: orders.map((o) => o.userId) } }, select: { id: true, email: true, name: true } }),
    db.resource.findMany({ where: { id: { in: orders.map((o) => o.resourceId) } }, select: { id: true, title: true } }),
  ]);
  const u = new Map(users.map((x) => [x.id, x]));
  const r = new Map(items.map((x) => [x.id, x.title]));
  const paid = orders.filter((o) => o.status === "PAID");
  const total = paid.reduce((s, o) => s + o.amount, 0);
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="mb-4 mt-1 text-sm text-slate-500">Paid: {paid.length} orders, total ৳{total}. Showing the latest 200.</p>
      {orders.length === 0 && <p className="text-slate-600">No orders yet.</p>}
      <ul className="grid gap-2">
        {orders.map((o) => (
          <li key={o.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{r.get(o.resourceId) ?? "Deleted material"}</p>
              <p className="truncate text-xs text-slate-500">{u.get(o.userId)?.email ?? "Deleted user"} · {o.createdAt.toLocaleString("en-GB")}</p>
            </div>
            <span>৳{o.amount}</span>
            <span className={`rounded px-2 py-0.5 text-xs font-bold ${o.status === "PAID" ? "bg-green-100 text-green-700" : o.status === "PENDING" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>{o.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
