import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminNav from "@/components/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = (await auth())?.user;
  if (u?.role !== "ADMIN" && u?.role !== "TEACHER") redirect("/login");
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/50 to-orange-50/50">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-4 lg:flex-row">
        <AdminNav name={u?.name ?? "Admin"} role={u?.role} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}