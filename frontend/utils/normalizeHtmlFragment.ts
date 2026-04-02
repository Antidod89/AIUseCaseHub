// Нормализация HTML-фрагмента: убираем DOCTYPE, html/head/body
// и «заворачиваем» стили так, чтобы они работали только внутри .rich-html.
export function normalizeHtmlFragment(html: string) {
  if (!html) return '';
  if (
    /<!DOCTYPE/i.test(html) ||
    /<html[^>]*>/i.test(html) ||
    /<body[^>]*>/i.test(html)
  ) {
    return html.trim();
  }

  let cleaned = html;

  const styleBlocks: string[] = [];
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, (match) => {
    const css = match
      .replace(/<style[^>]*>/i, '')
      .replace(/<\/style>/i, '');
    styleBlocks.push(css);
    return '';
  });

  cleaned = cleaned.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
  cleaned = cleaned.replace(/<head[\s\S]*?<\/head>/gi, '');
  cleaned = cleaned
    .replace(/<html[^>]*>/gi, '')
    .replace(/<\/html>/gi, '')
    .replace(/<body[^>]*>/gi, '')
    .replace(/<\/body>/gi, '');

  if (styleBlocks.length) {
    let css = styleBlocks.join('\n');
    css = css.replace(/\bbody\b/gi, '.rich-html');
    css = css.replace(/\bhtml\b/gi, '.rich-html');
    css = css.replace(/(^|})\s*([^@}{]+)\{/g, (m, sep, selector) => {
      const trimmed = (selector as string).trim();
      if (!trimmed) return m;
      if (/^\.rich-html\b/.test(trimmed)) {
        return `${sep} ${trimmed}{`;
      }
      return `${sep} .rich-html ${trimmed}{`;
    });

    cleaned = `<style>${css}</style>${cleaned}`;
  }

  return cleaned.trim();
}
