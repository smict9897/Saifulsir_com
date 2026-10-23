import { NextResponse } from "next/server";
import { staff } from "@/lib/guard";
import { extractText } from "@/lib/pdf-mcq/extract";
import { parseMcqText } from "@/lib/pdf-mcq/parse";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await staff();

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ ok: false, error: "একটি বৈধ PDF ফাইল নির্বাচন করুন।" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ ok: false, error: "শুধুমাত্র .pdf ফাইল আপলোড করা যাবে।" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const text = await extractText(buffer);

    if (!text || !text.trim()) {
      return NextResponse.json(
        { ok: false, error: "পিডিএফ থেকে টেক্সট পাওয়া যায়নি। এটি স্ক্যান করা বা ছবির PDF হতে পারে।" },
        { status: 422 }
      );
    }

    const questions = parseMcqText(text);

    if (questions.length === 0) {
      return NextResponse.json(
        { ok: false, error: "পিডিএফ থেকে কোনো MCQ প্রশ্ন আলাদা করা যায়নি। প্রশ্নপত্রের নম্বর ও অপশন ফরম্যাট চেক করুন।" },
        { status: 422 }
      );
    }

    return NextResponse.json({
      ok: true,
      count: questions.length,
      questions,
      warnings: questions
        .filter((q) => q.flags.length > 0)
        .map((q) => `প্রশ্ন ${q.number}: ${q.flags.join(", ")}`),
    });
  } catch (err: any) {
    console.error("PDF Import API Error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "সার্ভার এরর হয়েছে।" }, { status: 500 });
  }
}
