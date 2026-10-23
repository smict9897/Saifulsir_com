import { cleanText, toAsciiDigits, joinMarks } from "./text";

export type OptionKey = "A" | "B" | "C" | "D";

export type ParsedMcq = {
  number: number;
  text: string;
  options: Record<OptionKey, string>;
  correct: OptionKey | "";
  flags: string[];
};

const BN_TO_KEY: Record<string, OptionKey> = {
  "ক": "A", "খ": "B", "গ": "C", "ঘ": "D",
  "a": "A", "b": "B", "c": "C", "d": "D",
  "A": "A", "B": "B", "C": "C", "D": "D",
};

// ১। বা ০১। বা 1. দিয়ে প্রশ্ন শুরুর অবস্থান চিহ্নিত করা
const QSTART_REGEX = /(?:^|\n|\s{2,})([০-৯\d]{1,3})\s*[।\.\)]\s*/gu;

function findQuestionStarts(text: string) {
  const out: { num: number; index: number }[] = [];
  const re = new RegExp(QSTART_REGEX.source, "gu");
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    const rawNum = m[1];
    const num = Number(toAsciiDigits(rawNum));
    if (!isNaN(num) && num > 0) {
      out.push({ num, index: m.index });
    }
  }

  return out.sort((a, b) => a.index - b.index);
}

function findOptionMarkers(block: string) {
  const found: { key: OptionKey; index: number; len: number }[] = [];
  const re = /(?:\(|\b)([কখগঘabcdABCD])(?:\)|\.)\s*/gu;
  let m: RegExpExecArray | null;

  while ((m = re.exec(block)) !== null) {
    const key = BN_TO_KEY[m[1]];
    if (!key) continue;
    if (found.some((f) => f.key === key)) continue;
    found.push({ key, index: m.index, len: m[0].length });
  }

  return found.sort((a, b) => a.index - b.index);
}

function parseBlock(num: number, block: string): ParsedMcq {
  const flags: string[] = [];
  const markers = findOptionMarkers(block);

  const stemEnd = markers.length ? markers[0].index : block.length;
  let text = block
    .slice(0, stemEnd)
    .replace(/^\s*[০-৯\d]{1,3}\s*[।\.\)]\s*/, "")
    .trim();

  // স্কুলের প্রাতিষ্ঠানিক হেডার থাকলে তা প্রশ্ন থেকে কেটে ফেলা
  if (text.includes("আপনার প্রতিষ্ঠানের নাম") || text.includes("বহুনির্বাচনি অংশ") || text.includes("পূর্ণমান")) {
    const splitPoint = text.search(/নিচের|কোনটি|কাকে|কত|কী|কোন|একটি|[০-৯\d]{1,3}\s*[।\.\)]/u);
    if (splitPoint !== -1) {
      text = text.slice(splitPoint).replace(/^[০-৯\d]{1,3}\s*[।\.\)]\s*/, "").trim();
    }
  }

  const options: Record<OptionKey, string> = { A: "", B: "", C: "", D: "" };
  markers.forEach((mk, i) => {
    const s = mk.index + mk.len;
    const e = i + 1 < markers.length ? markers[i + 1].index : block.length;
    let optText = block.slice(s, e).trim();

    // অপশনের সাথে উত্তর লেখা থাকলে আলাদা করা
    const ansMatch = optText.match(/\[?(?:উত্তর|Ans|সঠিক)\s*[:ঃ]?\s*([কখগঘabcdABCD])\]?/i);
    if (ansMatch) {
      optText = optText.replace(ansMatch[0], "").trim();
    }

    options[mk.key] = optText;
  });

  if (!text) flags.push("প্রশ্নের বক্তব্য খালি");
  for (const k of ["A", "B", "C", "D"] as OptionKey[]) {
    if (!options[k]) flags.push(`অপশন ${k} পাওয়া যায়নি`);
  }

  if (/চিত্র|উদ্দীপক|প্রতীক|চিহ্ন/u.test(text) && !/i\.|ii\./.test(text)) {
    flags.push("চিত্র সংবলিত প্রশ্ন হতে পারে");
  }

  return { number: num, text, options, correct: "", flags };
}

// 🎯 বাউন্ডেড পার্সিং: প্রতিটি প্রশ্নকে পরবর্তী প্রশ্নের আগেই সীমাবদ্ধ রাখা
export function parseMcqText(raw: string): ParsedMcq[] {
  const body = joinMarks(cleanText(raw));
  const starts = findQuestionStarts(body);

  if (starts.length === 0) return [];

  const parsedList: ParsedMcq[] = [];

  for (let i = 0; i < starts.length; i++) {
    const currentStart = starts[i].index;
    // পরবর্তী প্রশ্নের শুরুতেই বর্তমান প্রশ্নের সীমানা শেষ হবে
    const nextStart = i + 1 < starts.length ? starts[i + 1].index : body.length;
    const block = body.slice(currentStart, nextStart).trim();

    if (block) {
      parsedList.push(parseBlock(starts[i].num, block));
    }
  }

  return parsedList;
}
