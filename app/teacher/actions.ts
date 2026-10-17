"use server";
import { signIn } from "@/auth";

export async function teacherGoogle(): Promise<void> {
  await signIn("google", { redirectTo: "/dashboard" });
}
