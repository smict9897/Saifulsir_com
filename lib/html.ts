import sanitizeHtml from "sanitize-html";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const tagRe = /(^|[\s(])#([\p{L}\p{M}\p{N}_-]{1,40})/gu;

function options(link: boolean): sanitizeHtml.IOptions {
  return {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s", "sub", "sup", "h1", "h2", "h3", "h4", "h5", "h6",
      "blockquote", "ul", "ol", "li", "a", "img", "hr", "span", "mark", "div", "section",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col"
    ],
    allowedAttributes: {
      "*": ["style", "class", "id", "title", "dir", "align"],
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      table: ["border", "cellpadding", "cellspacing", "width", "style", "class"],
      tr: ["style", "class"],
      th: ["rowspan", "colspan", "width", "scope", "style", "class"],
      td: ["rowspan", "colspan", "width", "style", "class"],
    },
    // গুরুত্বপূর্ণ: এখানে allowedStyles দেওয়া যাবে না।
    // না দিলে সব inline style (border, background, color ...) অক্ষত থাকে।
    allowedSchemes: ["https", "http", "mailto", "data"],
    allowedSchemesByTag: { img: ["https", "http", "data"] },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      b: "strong",
      i: "em",
      strike: "s",
      del: "s",
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer nofollow" }),
      img: (_t, a) => ({
        tagName: "img",
        attribs: { ...a, loading: "lazy" },
      }),
    },
    textFilter: link
      ? (text, tag) => (tag === "a" ? text : text.replace(tagRe, (_m, pre: string, t: string) => `${pre}<a href="/tag/${encodeURIComponent(t.toLowerCase())}">#${t}</a>`))
      : undefined,
  };
}

export const isHtml = (body: string) => /^\s*<(p|h[1-6]|ul|ol|div|blockquote|img|hr|span|strong|em|table|section)\b/i.test(body);

export const cleanHtml = (html: string) => sanitizeHtml(html, options(false));
export const renderHtml = (html: string) => sanitizeHtml(html, options(true));

export function htmlToText(html: string): string {
  const spaced = html.replace(/<\/(p|h[1-6]|li|blockquote|div|tr|td|th|section)>|<br\s*\/?>/gi, " ");
  return sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

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
