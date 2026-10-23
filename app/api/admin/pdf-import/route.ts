import { NextResponse } from "next/server";
import { staff } from "@/lib/guard";
import { parseAllQuestionsFromText } from "@/lib/pdf-mcq/parse";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await staff();

    const body = await req.json();
    const rawText = String(body.text || "").trim();

    if (!rawText) {
      return NextResponse.json(
        { ok: false, error: "কোনো টেক্সট পাওয়া যায়নি। ফাইলটি খালি হতে পারে।" },
        { status: 422 }
      );
    }

    // ৩টি ক্যাটাগরির প্রশ্ন আলাদা করা
    const data = parseAllQuestionsFromText(rawText);

    const total = data.mcqs.length + data.shortQuestions.length + data.cqs.length;
    if (total === 0) {
      return NextResponse.json(
        { ok: false, error: "পিডিএফ থেকে কোনো প্রশ্ন আলাদা করা যায়নি। প্রশ্নপত্রের ফরম্যাট পরীক্ষা করুন।" },
        { status: 422 }
      );
    }

    return NextResponse.json({
      ok: true,
      mcqs: data.mcqs,
      shortQuestions: data.shortQuestions,
      cqs: data.cqs,
    });
  } catch (err: any) {
    console.error("PDF Import API Error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "সার্ভার এরর হয়েছে।" }, { status: 500 });
  }
}
