import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function staff() {
  const session = await auth();

  // শুধুমাত্র ADMIN অনুমতি পাবে
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("অননুমোদিত এক্সেস: শুধুমাত্র অ্যাডমিন এই কাজটি করতে পারবেন।");
  }

  return session.user;
}
