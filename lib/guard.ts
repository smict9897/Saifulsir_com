import { auth } from "@/auth";
export async function staff() {
  const r = (await auth())?.user?.role;
  if (r !== "ADMIN" && r !== "TEACHER") throw new Error("Not allowed");
}
