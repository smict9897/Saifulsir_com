import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function QuestionBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // লগইন না থাকলে লগইন পেজে পাঠাবে, লগইনের পর আবার প্রশ্নপত্র পেজে ফিরবে
  if (!session?.user) {
    redirect("/login?next=" + encodeURIComponent("/question-builder"));
  }

  return <>{children}</>;
}
