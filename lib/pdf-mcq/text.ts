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
    .replace(/[ \t]+(?=[\u09BC\u09BE-\u09CD\u09D7\u0981-\u0983\u09DF])/g, "")
    .replace(/\u09CD[ \t]+/g, "\u09CD")
    .replace(/([অ-হড়-য়০-৯a-zA-Z])\s+([়্া-ৌঁ-ঃ])/gu, "$1$2")
    .replace(/([্])\s+([অ-হড়-য়])/gu, "$1$2")
    .replace(/[ \t]{2,}/g, " ");
}
