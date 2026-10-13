import type { Metadata } from "next";
import NuCgpa from "@/components/tools/nu-cgpa";
export const metadata: Metadata = {
  title: "NU CGPA ক্যালকুলেটর",
  description: "ক্রেডিট আর গ্রেড বসিয়ে জাতীয় বিশ্ববিদ্যালয়ের CGPA হিসাব করুন।",
  alternates: { canonical: "/tools/nu-cgpa" },
};
export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">NU CGPA ক্যালকুলেটর</h1>
      <div className="mt-6"><NuCgpa /></div>
    </main>
  );
}
