import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/auth";

export default async function QuestionBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    // লগইনের পর ইউজার যে পেজে যেতে চেয়েছিল সেখানেই ফিরবে
    const h = await headers();
    const path = h.get("x-pathname") || "/question-builder";
    redirect(`/login?callbackUrl=${encodeURIComponent(path)}`);
  }

  return <>{children}</>;
}
