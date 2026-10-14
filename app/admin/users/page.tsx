import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { deleteUser, setRole } from "@/app/actions/admin";
export const dynamic = "force-dynamic";

export default async function Page() {
  const me = (await auth())?.user;
  if (me?.role !== "ADMIN") redirect("/admin");
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold">Users ({users.length})</h1>
      <p className="mb-4 mt-1 text-sm text-slate-500">ADMIN can do everything. TEACHER can add content but cannot change settings or users.</p>
      <ul className="grid gap-2">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{u.name ?? "No name"}{u.id === me.id && <span className="ml-2 text-xs text-slate-500">(you)</span>}</p>
              <p className="truncate text-xs text-slate-500">{u.email} · joined {u.createdAt.toLocaleDateString("en-GB")}</p>
            </div>
            {u.id !== me.id && (
              <>
                <form action={setRole.bind(null, u.id)} className="flex gap-1">
                  <select name="role" defaultValue={u.role} aria-label="Role" className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm">
                    <option>STUDENT</option><option>TEACHER</option><option>ADMIN</option>
                  </select>
                  <button className="rounded-lg bg-royal px-3 py-1 text-sm text-white">Save</button>
                </form>
                <form action={deleteUser.bind(null, u.id)}><button className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-700">Delete</button></form>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
