/**
 * A deliberately small HTML allowlist for letter bodies.
 *
 * The editor only ever produces a handful of tags, so instead of pulling in a
 * full sanitiser we drop every tag that isn't on the list and strip every
 * attribute except a safe `href` on links.
 */

const ALLOWED = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
]);

const SAFE_HREF = /^(https?:\/\/|mailto:)/i;

export function sanitizeLetterHtml(input: string): string {
  // Remove anything that could execute, contents included.
  let html = input.replace(
    /<(script|style|iframe|object|embed|svg|math)\b[\s\S]*?<\/\1>/gi,
      "",
  );
  html = html.replace(/<!--[\s\S]*?-->/g, "");

  html = html.replace(
    /<\s*(\/?)\s*([a-zA-Z0-9-]+)((?:"[^"]*"|'[^']*'|[^>])*)>/g,
    (_match, closing: string, rawTag: string, rawAttrs: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED.has(tag)) return "";
      if (closing) return `</${tag}>`;

      if (tag === "a") {
        const href = /href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(rawAttrs);
        const value = (href?.[2] ?? href?.[3] ?? href?.[4] ?? "").trim();
        if (!SAFE_HREF.test(value)) return "<span>";
        const safe = value.replace(/"/g, "&quot;");
        return `<a href="${safe}" target="_blank" rel="noopener noreferrer nofollow">`;
      }

      return `<${tag}>`;
    },
  );

  // Any <span> placeholders left from unsafe links are harmless but noisy.
  html = html.replace(/<\/?span>/g, "");

  return html.trim();
}

/** Plain-text preview used on letter cards and the dashboard. */
export function letterPreview(html: string, length = 160): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}
