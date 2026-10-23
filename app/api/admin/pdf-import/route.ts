import { NextResponse } from "next/server";
import { staff } from "@/lib/guard";
import { extractPages } from "@/lib/pdf-mcq/extract";
import { parseMcqText } from "@/lib/pdf-mcq/parse";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await staff();

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "PDF ফাইল দিন।" }, { status: 400 });
    }

    const pages = await extractPages(await file.arrayBuffer());

    // পৃষ্ঠার সব শব্দ উপর থেকে নিচে, বাঁ থেকে ডানে জোড়া দিয়ে একটি টেক্সট বানানো
    const lines: string[] = [];
    for (const pg of pages) {
      const sorted = [...pg.items].sort((a, b) =>
        Math.abs(a.y - b.y) > 3 ? a.y - b.y : a.x - b.x
      );
      let line = "";
      let lastY = -1;
      for (const it of sorted) {
        if (lastY !== -1 && Math.abs(it.y - lastY) > 3) {
          lines.push(line);
          line = "";
        }
        line += (line ? " " : "") + it.str;
        lastY = it.y;
      }
      if (line) lines.push(line);
    }
    const text = lines.join("\n");

    if (!text.trim()) {
      return NextResponse.json(
        { ok: false, error: "এটি স্ক্যান PDF বলে মনে হচ্ছে, টেক্সট পাওয়া যায়নি।" },
        { status: 422 }
      );
    }

    const questions = parseMcqText(text);

    return NextResponse.json({
      ok: true,
      count: questions.length,
      questions,
      warnings: questions
        .filter((q) => q.flags.length)
        .map((q) => `প্রশ্ন ${q.number}: ${q.flags.join(", ")}`),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "সার্ভার এরর" }, { status: 500 });
  }
}
