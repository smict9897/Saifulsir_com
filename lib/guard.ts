import { auth } from "@/auth";

export async function staff() {
  const r = (await auth())?.user?.role;
  if (r !== "ADMIN" && r !== "TEACHER") throw new Error("Not allowed");
}

export async function admin() {
  const u = (await auth())?.user;
  if (u?.role !== "ADMIN") throw new Error("Only an admin can do this.");
  return u;
}
