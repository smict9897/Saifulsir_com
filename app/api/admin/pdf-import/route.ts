import { NextResponse } from "next/server";
import { staff } from "@/lib/guard";
import * as parser from "@/lib/pdf-mcq/parse";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await staff();

    const body = await req.json();
    const rawText = String(body.text || "").trim();
    const mode = (body.mode || "AUTO") as "AUTO" | "MCQ" | "SHORT" | "CQ";

    if (!rawText) {
      return NextResponse.json(
        { ok: false, error: "কোনো টেক্সট পাওয়া যায়নি। ফাইলটি খালি হতে পারে।" },
        { status: 422 }
      );
    }

    // 🎯 ইউজার যে মোড সিলেক্ট করেছে সেই মোড অনুযায়ী পার্স করা
    let data: any;
    if (typeof (parser as any).parseAllQuestionsFromText === "function") {
      data = (parser as any).parseAllQuestionsFromText(rawText, mode);
    } else if (typeof (parser as any).parseMcqText === "function") {
      const mcqs = (parser as any).parseMcqText(rawText);
      data = { mcqs, shortQuestions: [], cqs: [] };
    } else {
      throw new Error("পার্সার ফাংশন পাওয়া যায়নি");
    }

    return NextResponse.json({
      ok: true,
      mcqs: data.mcqs || [],
      shortQuestions: data.shortQuestions || [],
      cqs: data.cqs || [],
    });
  } catch (err: any) {
    console.error("PDF Import API Error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "সার্ভার এরর হয়েছে।" }, { status: 500 });
  }
}
