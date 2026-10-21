import sanitizeHtml from "sanitize-html";

// HTML থেকে প্লেইন টেক্সট বের করার হেল্পার
export function htmlToText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// টাস্ক D: সার্ভার সাইডে কঠোর স্যানিটাইজেশন
export function cleanHtml(dirty: string): string {
  if (!dirty) return "";

  return sanitizeHtml(dirty, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "strong", "b", "em", "i", "u", "s", "sub", "sup",
      "blockquote", "pre", "code",
      "ul", "ol", "li",
      "table", "thead", "tbody", "tr", "th", "td",
      "a", "img",
      "figure", "figcaption",
      "div", "span",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      th: ["colspan", "rowspan", "align"],
      td: ["colspan", "rowspan", "align"],
      div: ["class"],
      span: ["class"],
      p: ["class"],
      table: ["class"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || "";
        const isExternal = /^https?:\/\//i.test(href);
        return {
          tagName: "a",
          attribs: {
            ...attribs,
            ...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {}),
          },
        };
      },
    },
    disallowedTagsMode: "discard",
  });
}
