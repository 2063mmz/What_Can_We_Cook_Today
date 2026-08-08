/**
 * Text normalisation used everywhere two ingredient names have to be compared.
 *
 * The rules are deliberately conservative: it is much worse to claim a match
 * that isn't there ("you have everything!" — you don't) than to miss one.
 */

const CJK = /[㐀-鿿぀-ヿ가-힯]/;

/** True when the text is mostly ideographic, so word boundaries don't apply. */
export function isCjk(text: string): boolean {
  return CJK.test(text);
}

/**
 * Lower-cases, strips accents, punctuation and spacing, and removes a simple
 * English plural so "Tomatoes" and "tomato" land on the same key.
 */
export function normalizeName(raw: string): string {
  let text = raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents
    .toLowerCase()
    .trim();

  // Drop bracketed asides and punctuation, keep letters/digits/CJK.
  text = text
    .replace(/\([^)]*\)/g, ' ')
    .replace(/（[^）]*）/g, ' ')
    .replace(/[^\p{Letter}\p{Number}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!isCjk(text)) {
    text = text
      .split(' ')
      .map(singularize)
      .filter(Boolean)
      .join(' ');
  } else {
    // Ideographic text has no meaningful spaces.
    text = text.replace(/\s+/g, '');
  }

  return text;
}

function singularize(word: string): string {
  if (word.length <= 3) return word;
  // berries -> berry
  if (word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  // tomatoes -> tomato, potatoes -> potato
  if (word.endsWith('oes')) return word.slice(0, -2);
  // dishes -> dish, boxes -> box
  if (word.endsWith('ses') || word.endsWith('xes') || word.endsWith('hes')) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

/** Whether `needle` appears in `haystack` at a word boundary. */
function containsWord(haystack: string, needle: string): boolean {
  const index = haystack.indexOf(needle);
  if (index === -1) return false;
  const before = index === 0 ? ' ' : haystack[index - 1];
  const afterIndex = index + needle.length;
  const after = afterIndex >= haystack.length ? ' ' : haystack[afterIndex];
  return before === ' ' && after === ' ';
}

/**
 * Whether two ingredient names refer to the same thing.
 *
 * Exact match always counts. Beyond that, one name may contain the other —
 * "chicken" covers "chicken breast", 鸡蛋 covers 鸡蛋液 — but only when the
 * shorter name is long enough to be specific, so "egg" never matches
 * "eggplant" and 蛋 never matches 皮蛋.
 */
export function namesMatch(a: string, b: string): boolean {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left || !right) return false;
  if (left === right) return true;

  const [short, long] = left.length <= right.length ? [left, right] : [right, left];
  if (isCjk(short) || isCjk(long)) {
    return short.length >= 2 && long.includes(short);
  }
  return short.length >= 4 && containsWord(long, short);
}

/** Case-insensitive, accent-insensitive substring test used by search boxes. */
export function looseIncludes(haystack: string, query: string): boolean {
  const q = normalizeName(query);
  if (!q) return true;
  return normalizeName(haystack).includes(q);
}

/** Title-cases the first letter only, leaving CJK and the rest untouched. */
export function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
