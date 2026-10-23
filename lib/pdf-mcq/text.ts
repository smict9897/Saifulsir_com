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

// 🎯 উন্নত বাংলা গ্লিফ, কার, ও-কার ও যুক্তাক্ষর জোড়া লাগানোর অ্যালগরিদম
export function joinMarks(s: string): string {
  if (!s) return "";
  let text = s;

  // ১. উল্টে যাওয়া ই-কার (ি), এ-কার (ে), ঐ-কার (ৈ) সঠিক ব্যঞ্জনে নিয়ে আসা
  text = text.replace(/([\u09BF\u09C7\u09C8])\s*([ক-হড়-য়])/gu, "$2$1");

  // ২. বিচ্ছিন্ন হসন্ত, কার ও রেফ জোড়া লাগানো
  text = text
    .replace(/([অ-হড়-য়০-৯a-zA-Z])\s+([়্া-ৌঁ-ঃ])/gu, "$1$2")
    .replace(/([্])\s+([অ-হড়-য়])/gu, "$1$2")
    .replace(/([অ-হ])\s+্র/gu, "$1্র")
    .replace(/([অ-হ])\s+্য/gu, "$1্য")
    .replace(/থ\s*র\s*্/gu, "র্থ");

  // ৩. 🎯 সাধারণ PDF বানান ও ও-কার মিসিং ফিক্স (যেমন: কানট -> কোনটি)
  text = text
    .replace(/ক\s*া\s*ন\s*ট/gu, "কোনটি")
    .replace(/স\s*ঠ\s*ক/gu, "সঠিক")
    .replace(/পদাথ\b/gu, "পদার্থ")
    .replace(/পদাথর্বিজ্ঞান/gu, "পদার্থবিজ্ঞান")
    .replace(/বি\s+ানী/gu, "বিজ্ঞানী")
    .replace(/ব্যব্\s*া/gu, "ব্যবস্থা")
    .replace(/অ\s+ালগরিদম/gu, "অ্যালগরিদম")
    .replace(/আন্ত\s+র্জাতিক/gu, "আন্তর্জাতিক")
    .replace(/চাল\s*স\s*ব\s*াবেজ/gu, "চার্লস ব্যাবেজ")
    .replace(/আবি\s*ার/gu, "আবিষ্কার")
    .replace(/ম\s*াক্স\s*ওয়েল/gu, "ম্যাক্সওয়েল")
    .replace(/তড়িৎ\s*ও\s*চৌম্ব\s*ক/gu, "তড়িৎ ও চৌম্বক")
    .replace(/প্র\s*কাশ/gu, "প্রকাশ")
    .replace(/যা\s*গা\s*যোগ\s*দক্ষ\s*তা/gu, "যোগাযোগ দক্ষতা")
    .replace(/জন\s+কী\s+ধরনের/gu, "জন্য কী ধরনের");

  // ৪. ব্র্যাকেটের ভেতরের অপশন পরিষ্কার: "( ক )" -> "(ক)"
  text = text.replace(/\(\s*([কখগঘabcdABCD])\s*[\)\.]/gu, "($1)");

  // ৫. শব্দের সাথে নম্বর জোড়া লেগে থাকলে মাঝখানে এন্টার দেওয়া (যেমন: রাখা০৭। -> রাখা \n ০৭।)
  text = text.replace(/([^\d০-৯\s\n])([০-৯\d]{1,3}\s*[।\.\)])/gu, "$1\n$2");

  return text.replace(/[ \t]{2,}/g, " ");
}
