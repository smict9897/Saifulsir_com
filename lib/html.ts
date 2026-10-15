import sanitizeHtml from "sanitize-html";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const colour = [/^#[0-9a-f]{3,8}$/i, /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d.]+\s*)?\)$/i];
const sizes: Record<string, string> = { "1": "x-small", "2": "small", "3": "medium", "4": "large", "5": "x-large", "6": "xx-large", "7": "xx-large" };
const tagRe = /(^|[\s(])#([\p{L}\p{M}\p{N}_-]{1,40})/gu;

function options(link: boolean): sanitizeHtml.IOptions {
  return {
    allowedTags: ["p", "br", "strong", "em", "u", "s", "sub", "sup", "h2", "h3", "h4", "blockquote", "ul", "ol", "li", "a", "img", "hr", "span", "mark", "div"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      p: ["style"], div: ["style"], span: ["style"], h2: ["style"], h3: ["style"], h4: ["style"], li: ["style"], blockquote: ["style"],
    },
    allowedStyles: {
      "*": {
        color: colour,
        "background-color": colour,
        "text-align": [/^(left|right|center|justify)$/],
        "font-size": [/^(xx-small|x-small|small|medium|large|x-large|xx-large)$/],
      },
    },
    allowedSchemes: ["https", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      b: "strong",
      i: "em",
      strike: "s",
      del: "s",
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer nofollow" }),
      img: (_t, a) => ({ tagName: "img", attribs: { ...a, loading: "lazy" } }),
      font: (_t, a) => {
        const style: string[] = [];
        if (a.color) style.push(`color:${a.color}`);
        if (a.size && sizes[a.size]) style.push(`font-size:${sizes[a.size]}`);
        return { tagName: "span", attribs: style.length ? { style: style.join(";") } : {} };
      },
    },
    // The text reaching this function is already escaped, so the links below are safe.
    textFilter: link
      ? (text, tag) => (tag === "a" ? text : text.replace(tagRe, (_m, pre: string, t: string) => `${pre}<a href="/tag/${encodeURIComponent(t.toLowerCase())}">#${t}</a>`))
      : undefined,
  };
}

export const isHtml = (body: string) => /^\s*<(p|h[1-6]|ul|ol|div|blockquote|img|hr|span|strong|em)\b/i.test(body);

// Run before saving.
export const cleanHtml = (html: string) => sanitizeHtml(html, options(false));
// Run before showing: same clean-up, plus #hashtags become links.
export const renderHtml = (html: string) => sanitizeHtml(html, options(true));

export function htmlToText(html: string): string {
  const spaced = html.replace(/<\/(p|h[1-6]|li|blockquote|div)>|<br\s*\/?>/gi, " ");
  return sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

// Old posts were plain text with "## Heading" lines. This turns them into HTML for the editor.
export function bodyToEditorHtml(body: string): string {
  if (isHtml(body)) return body;
  return body.split(/\n{2,}/).map((raw) => {
    const t = raw.trim();
    const m = t.match(/^!\[([^\]]*)\]\((https:\/\/[^\s)]+)\)$/);
    if (m) return `<p><img src="${esc(m[2])}" alt="${esc(m[1])}"></p>`;
    if (t.startsWith("### ")) return `<h3>${esc(t.slice(4))}</h3>`;
    if (t.startsWith("## ")) return `<h2>${esc(t.slice(3))}</h2>`;
    return `<p>${esc(t).replace(/\n/g, "<br>")}</p>`;
  }).join("");
}
