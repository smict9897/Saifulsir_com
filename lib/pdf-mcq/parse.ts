import { cleanText, toAsciiDigits, joinMarks } from "./text";

export type OptionKey = "A" | "B" | "C" | "D";

export type ParsedMcq = {
  number: number;
  text: string;
  options: Record<OptionKey, string>;
  correct: OptionKey | "";
  flags: string[];
};

export type ParsedShort = {
  number: number;
  text: string;
  marks: string;
};

export type ParsedCQ = {
  number: number;
  stimulus: string;
  subQuestions: {
    k: string;
    kh: string;
    g: string;
    gh: string;
  };
};

export type MultiSectionParseResult = {
  mcqs: ParsedMcq[];
  shortQuestions: ParsedShort[];
  cqs: ParsedCQ[];
};

const BN_TO_KEY: Record<string, OptionKey> = {
  "ক": "A", "খ": "B", "গ": "C", "ঘ": "D",
  "a": "A", "b": "B", "c": "C", "d": "D",
  "A": "A", "B": "B", "C": "C", "D": "D",
};

// ১। বা ০১। বা 1. দিয়ে প্রশ্ন নম্বরের সীমানা তৈরি
const QSTART_REGEX = /(?:^|\n|\s{2,})([০-৯\d]{1,3})\s*[।\.\)]\s*/gu;

function sliceSectionByNumbers(sectionText: string) {
  const re = new RegExp(QSTART_REGEX.source, "gu");
  const matches: { index: number; num: number }[] = [];
  let m: RegExpExecArray | null;

  while ((m = re.exec(sectionText)) !== null) {
    const n = Number(toAsciiDigits(m[1]));
    if (!isNaN(n) && n > 0) {
      matches.push({ index: m.index, num: n });
    }
  }

  const chunks: { num: number; text: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const s = matches[i].index;
    const e = i + 1 < matches.length ? matches[i + 1].index : sectionText.length;
    chunks.push({ num: matches[i].num, text: sectionText.slice(s, e).trim() });
  }
  return chunks;
}

export function parseAllQuestionsFromText(raw: string): MultiSectionParseResult {
  const body = joinMarks(cleanText(raw));

  // ৩টি সেকশনের সীমানা খোঁজা
  const shortIdx = body.search(/সং\s*ক্ষি\s*প্ত\s*উ\s*ত্ত\s*র\s*প্র\s*শ্ন|সং\s*ক্ষি\s*প্ত\s*প্র\s*শ্ন/iu);
  const cqIdx = body.search(/সৃ\s*জ\s*ন\s*শী\s*ল\s*প্র\s*শ্ন/iu);

  let mcqText = "";
  let shortText = "";
  let cqText = "";

  if (shortIdx !== -1 && cqIdx !== -1) {
    if (shortIdx < cqIdx) {
      mcqText = body.slice(0, shortIdx);
      shortText = body.slice(shortIdx, cqIdx);
      cqText = body.slice(cqIdx);
    } else {
      mcqText = body.slice(0, cqIdx);
      cqText = body.slice(cqIdx, shortIdx);
      shortText = body.slice(shortIdx);
    }
  } else if (shortIdx !== -1) {
    mcqText = body.slice(0, shortIdx);
    shortText = body.slice(shortIdx);
  } else if (cqIdx !== -1) {
    mcqText = body.slice(0, cqIdx);
    cqText = body.slice(cqIdx);
  } else {
    mcqText = body;
  }

  const result: MultiSectionParseResult = {
    mcqs: [],
    shortQuestions: [],
    cqs: [],
  };

  // 📝 ১. বহুনির্বাচনি (MCQ) পার্সিং
  if (mcqText) {
    const mcqChunks = sliceSectionByNumbers(mcqText);
    mcqChunks.forEach(({ num, text }) => {
      let qBlock = text;
      if (qBlock.includes("প্রতিষ্ঠানের নাম") || qBlock.includes("বহুনির্বাচনি অংশ")) {
        const p = qBlock.search(/[০-৯\d]{1,3}\s*[।\.]\s*/u);
        if (p !== -1) qBlock = qBlock.slice(p);
      }

      const k = qBlock.search(/(?:\(|\b)[কaA][\.\)]/u);
      const kh = qBlock.search(/(?:\(|\b)[খbB][\.\)]/u);
      const g = qBlock.search(/(?:\(|\b)[গcC][\.\)]/u);
      const gh = qBlock.search(/(?:\(|\b)[ঘdD][\.\)]/u);

      if (k !== -1 && kh !== -1 && g !== -1 && gh !== -1 && k < kh && kh < g && g < gh) {
        const stem = qBlock.slice(0, k).replace(/^\s*[০-৯\d]{1,3}\s*[।\.]\s*/, "").trim();
        const optA = qBlock.slice(k, kh).replace(/^(?:\(|\b)[কaA][\.\)]\s*/u, "").trim();
        const optB = qBlock.slice(kh, g).replace(/^(?:\(|\b)[খbB][\.\)]\s*/u, "").trim();
        const optC = qBlock.slice(g, gh).replace(/^(?:\(|\b)[গcC][\.\)]\s*/u, "").trim();
        const optD = qBlock.slice(gh).replace(/^(?:\(|\b)[ঘdD][\.\)]\s*/u, "").trim();

        result.mcqs.push({
          number: num,
          text: stem,
          options: { A: optA, B: optB, C: optC, D: optD },
          correct: "",
          flags: [],
        });
      }
    });
  }

  // ✍️ ২. সংক্ষিপ্ত প্রশ্ন পার্সিং (৬৮টি প্রশ্ন উদ্ধার)
  if (shortText) {
    const shortChunks = sliceSectionByNumbers(shortText);
    shortChunks.forEach(({ num, text }) => {
      const qClean = text
        .replace(/^\s*[০-৯\d]{1,3}\s*[।\.]\s*/, "")
        .replace(/সং\s*ক্ষি\s*প্ত\s*উ\s*ত্ত\s*র\s*প্র\s*শ্ন.*/u, "")
        .replace(/৬৮\s*x\s*২\s*=\s*১৩৬.*/u, "")
        .trim();

      if (qClean.length > 5) {
        result.shortQuestions.push({
          number: num,
          text: qClean,
          marks: "২",
        });
      }
    });
  }

  // 🧠 ৩. সৃজনশীল প্রশ্ন (CQ) পার্সিং (একটার ভেতর আরেকটা ঢুকবে না)
  if (cqText) {
    const cqChunks = sliceSectionByNumbers(cqText);
    cqChunks.forEach(({ num, text }) => {
      const k = text.search(/\(ক\)/);
      const kh = text.search(/\(খ\)/);
      const g = text.search(/\(গ\)/);
      const gh = text.search(/\(ঘ\)/);

      if (k !== -1 && kh !== -1 && g !== -1 && gh !== -1 && k < kh && kh < g && g < gh) {
        const stimulus = text
          .slice(0, k)
          .replace(/^\s*[০-৯\d]{1,3}\s*[।\.]\s*/, "")
          .replace(/সৃ\s*জ\s*ন\s*শী\s*ল\s*প্র\s*শ্ন.*/u, "")
          .trim();

        const subK = text.slice(k, kh).replace(/^\(ক\)\s*/, "").trim();
        const subKh = text.slice(kh, g).replace(/^\(খ\)\s*/, "").trim();
        const subG = text.slice(g, gh).replace(/^\(গ\)\s*/, "").trim();
        const subGh = text.slice(gh).replace(/^\(ঘ\)\s*/, "").trim();

        result.cqs.push({
          number: num,
          stimulus: stimulus || "উদ্দীপক",
          subQuestions: { k: subK, kh: subKh, g: subG, gh: subGh },
        });
      }
    });
  }

  return result;
}

export function parseMcqText(raw: string) {
  const res = parseAllQuestionsFromText(raw);
  return res.mcqs;
}
