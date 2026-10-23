import { NextResponse } from "next/server";
import { staff } from "@/lib/guard";
import { parseMcqText } from "@/lib/pdf-mcq/parse";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await staff();

    const body = await req.json();
    const rawText = String(body.text || "").trim();

    if (!rawText) {
      return NextResponse.json(
        { ok: false, error: "কোনো টেক্সট পাওয়া যায়নি। ফাইলটি খালি অথবা স্ক্যান করা ছবি হতে পারে।" },
        { status: 422 }
      );
    }

    // পিওর কোড ও বাউন্ডেড পার্সিং রান করা
    const questions = parseMcqText(rawText);

    if (questions.length === 0) {
      return NextResponse.json(
        { ok: false, error: "পিডিএফ থেকে প্রশ্ন আলাদা করা সম্ভব হয়নি। ফরম্যাট পরীক্ষা করুন।" },
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
