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

export function joinMarks(s: string): string {
  if (!s) return "";
  return s
    // কার ও যুক্তবর্ণের মাঝের অযাচিত ফাঁকা মুছে ফেলা
    .replace(/([অ-হড়-য়০-৯a-zA-Z])\s+([়্া-ৌঁ-ঃ])/gu, "$1$2")
    .replace(/([্])\s+([অ-হড়-য়])/gu, "$1$2")
    .replace(/([অ-হ])\s+্র/gu, "$1্র")
    .replace(/([অ-হ])\s+্য/gu, "$1্য")
    // ব্র্যাকেট অপশন পরিষ্কার করা: "( ক )" -> "(ক)"
    .replace(/\(\s*([কখগঘabcdABCD])\s*[\)\.]/gu, "($1)")
    .replace(/[ \t]{2,}/g, " ");
}
