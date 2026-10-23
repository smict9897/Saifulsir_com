const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export function cleanText(s: string): string {
  if (!s) return "";
  return s
    .replace(/\r\n?/g, "\n")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .normalize("NFC");
}

export function toAsciiDigits(s: string): string {
  if (!s) return "";
  return s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

// 🎯 উল্টে যাওয়া হ্রস্ব-ই কার (ি), এ-কার (ে), ঐ-কার (ৈ) ও ভাঙা যুক্তাক্ষর সোজা করার ইঞ্জিন
export function joinMarks(s: string): string {
  if (!s) return "";
  let text = s;

  // ১. উল্টে বামে চলে যাওয়া ই-কার, এ-কার, ঐ-কার সোজা করা: e.g. "ি ন" -> "নি", "ি ব" -> "বি"
  text = text.replace(/([\u09BF\u09C7\u09C8])\s*([ক-হড়-য়])/gu, "$2$1");

  // ২. বিচ্ছিন্ন হসন্ত, কার ও রেফ জোড়া লাগানো
  text = text
    .replace(/([অ-হড়-য়০-৯a-zA-Z])\s+([়্া-ৌঁ-ঃ])/gu, "$1$2")
    .replace(/([্])\s+([অ-হড়-য়])/gu, "$1$2")
    .replace(/([অ-হ])\s+্র/gu, "$1্র")
    .replace(/([অ-হ])\s+্য/gu, "$1্য")
    .replace(/থ\s*র\s*্/gu, "র্থ") // পদাথর্বিজ্ঞান -> পদার্থবিজ্ঞান ফিক্স
    .replace(/অন\s*্যান্য/gu, "অন্যান্য");

  // ৩. শব্দের শুরুতে একা একা বসে থাকা ভুল কার মুছে ফেলা (যেমন: লাইনের শুরুতে "ি নিচের" -> "নিচের")
  text = text.replace(/(?:^|\n|\s)[\u09BF\u09C7\u09C8]\s+/gu, " ");

  // ৪. ব্র্যাকেটের ভেতরের অপশন সোজা করা: "( ক )" -> "(ক)"
  text = text.replace(/\(\s*([কখগঘabcdABCD])\s*[\)\.]/gu, "($1)");

  return text.replace(/[ \t]{2,}/g, " ");
}
