import type { Lang } from '../../i18n';

const ENDPOINT = 'https://api.mymemory.translated.net/get';
const CACHE_PREFIX = 'wiet.title-translation.';

const API_LANG: Record<Lang, string> = {
  en: 'en',
  fr: 'fr',
  zh: 'zh-CN',
};

function cacheKey(text: string, source: Lang, target: Lang): string {
  return `${CACHE_PREFIX}${source}.${target}.${text.trim().toLocaleLowerCase()}`;
}

function readCache(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeCache(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Translation is an enhancement; blocked storage must not break inspiration.
  }
}

/**
 * Translates a short recipe title or search term and caches it permanently.
 * Long recipe bodies are deliberately never sent to the translation service.
 */
export async function translateShortText(
  text: string,
  source: Lang,
  target: Lang,
): Promise<string> {
  const clean = text.trim();
  if (!clean || source === target) return clean;

  const key = cacheKey(clean, source, target);
  const cached = readCache(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    q: clean,
    langpair: `${API_LANG[source]}|${API_LANG[target]}`,
  });

  try {
    const response = await fetch(`${ENDPOINT}?${params}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return clean;
    const data = (await response.json()) as {
      responseData?: { translatedText?: string };
    };
    const translated = data.responseData?.translatedText?.trim();
    if (!translated) return clean;
    writeCache(key, translated);
    return translated;
  } catch {
    return clean;
  }
}

export async function translateTitleSet(
  title: string,
  source: Lang,
): Promise<Partial<Record<Lang, string>>> {
  const entries = await Promise.all(
    (['en', 'zh', 'fr'] as const).map(async (target) => [
      target,
      await translateShortText(title, source, target),
    ] as const),
  );
  return Object.fromEntries(entries) as Partial<Record<Lang, string>>;
}
