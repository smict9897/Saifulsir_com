// HTML ট্যাবে লেখা পোস্ট চেনার জন্য একটি র‍্যাপার ব্যবহার হয়।
// not-prose ক্লাস Tailwind prose এর স্টাইল থেকে পোস্টকে আলাদা রাখে।
const OPEN = '<div class="raw-html not-prose">';

export const isRawBody = (b: string) => b.trim().startsWith(OPEN);

export const wrapRaw = (h: string) => (isRawBody(h) ? h.trim() : `${OPEN}${h.trim()}</div>`);

export const unwrapRaw = (b: string) => {
  const t = b.trim();
  return isRawBody(t) ? t.slice(OPEN.length).replace(/<\/div>\s*$/, "").trim() : b;
};
