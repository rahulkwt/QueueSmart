/**
 * Converts a limited subset of Markdown to safe HTML for AI chat responses.
 *
 * Security model — two layers:
 *   1. Entity escaping: all AI output is HTML-escaped before any transformation,
 *      so raw tags like <script> become &lt;script&gt; and are never executable.
 *   2. Allowlist strip: after our own markdown transforms insert controlled tags,
 *      a final pass removes any HTML tag not explicitly on the permitted list.
 *      This is defense-in-depth against regex edge cases or future code changes.
 *
 * Supported syntax:
 *   **bold**           → <strong>
 *   *italic*           → <em>
 *   `inline code`      → <code>
 *   - item / * item    → <ul><li> (consecutive lines grouped into one list)
 *   newlines           → <br>
 */

// Every tag we emit — nothing else may survive to the frontend.
const ALLOWED_TAG = /^<\/?(strong|em|code|ul|li)>$|^<br>$/i;

function stripDisallowedTags(html) {
  return html.replace(/<[^>]*>/g, (tag) => (ALLOWED_TAG.test(tag) ? tag : ""));
}

export function markdownToHtml(text) {
  if (!text) return "";

  // 1. Escape HTML entities — primary injection defence
  let s = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. Line-by-line: group consecutive bullet lines into <ul><li> blocks
  const lines = s.split("\n");
  const out = [];
  let inList = false;

  for (const line of lines) {
    const bullet = line.match(/^[-*•]\s+(.*)/);
    if (bullet) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${bullet[1]}</li>`);
    } else {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(line);
    }
  }
  if (inList) out.push("</ul>");

  s = out.join("\n");

  // 3. Inline transforms — bold before italic to avoid consuming ** as two *
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  s = s.replace(/`(.+?)`/g, "<code>$1</code>");

  // 4. Remaining newlines → <br>
  s = s.replace(/\n/g, "<br>");

  // 5. Allowlist strip — remove any tag that isn't ours (defense-in-depth)
  return stripDisallowedTags(s);
}
