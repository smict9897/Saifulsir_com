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
  let text = s;

  // ১. উল্টে বামে চলে যাওয়া ই-কার (ি), এ-কার (ে), ঐ-কার (ৈ) সঠিক বর্ণে নিয়ে আসা
  text = text.replace(/([\u09BF\u09C7\u09C8])\s*([ক-হড়-য়])/gu, "$2$1");

  // ২. বিচ্ছিন্ন হসন্ত ও কার জোড়া লাগানো
  text = text
    .replace(/([অ-হড়-য়০-৯a-zA-Z])\s+([়্া-ৌঁ-ঃ])/gu, "$1$2")
    .replace(/([্])\s+([অ-হড়-য়])/gu, "$1$2")
    .replace(/([অ-হ])\s+্র/gu, "$1্র")
    .replace(/([অ-হ])\s+্য/gu, "$1্য")
    .replace(/থ\s*র\s*্/gu, "র্থ");

  // ৩. ব্র্যাকেটের ভেতরের অপশন পরিষ্কার: "( ক )" -> "(ক)"
  text = text.replace(/\(\s*([কখগঘabcdABCD])\s*[\)\.]/gu, "($1)");

  // ৪. 🎯 সবচেয়ে জরুরি ফিক্স: শব্দের সাথে নম্বর জোড়া লেগে থাকলে মাঝখানে এন্টার দেওয়া
  // যেমন: "রাখা০৭।" -> "রাখা \n ০৭।", "তালিকা:১৪।" -> "তালিকা:\n ১৪।"
  text = text.replace(/([^\d০-৯\s\n])([০-৯\d]{1,3}\s*[।\.\)])/gu, "$1\n$2");

  return text.replace(/[ \t]{2,}/g, " ");
}
