// Превью описания кейса для списка: только текст, без HTML

export const CASE_EXCERPT_MAX_LENGTH = 200;

export function htmlToPlainText(html: string): string {
  if (!html) return '';
  let s = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<[^>]+>/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

export function excerptFromHtml(
  html: string,
  maxLen = CASE_EXCERPT_MAX_LENGTH
): string {
  const plain = htmlToPlainText(html);
  if (plain.length <= maxLen) {
    return plain;
  }
  return `${plain.slice(0, maxLen).trimEnd()}…`;
}
