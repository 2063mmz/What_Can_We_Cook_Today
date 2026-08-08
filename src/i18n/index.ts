import { en } from './en';
import { zh } from './zh';
import { fr } from './fr';
import {
  LANGUAGES,
  type Dictionary,
  type Lang,
  type TranslationKey,
  type TranslationVars,
} from './types';

export const dictionaries: Record<Lang, Dictionary> = { en, zh, fr };

export { LANGUAGES, LANG_LABELS, LANG_TAGS } from './types';
export type { Lang, TranslationKey, TranslationVars, Dictionary } from './types';

export const DEFAULT_LANG: Lang = 'en';

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

/** Picks the best supported language from the browser, falling back to English. */
export function detectLang(
  candidates: readonly string[] = navigator.languages ?? [],
): Lang {
  for (const raw of candidates) {
    const tag = raw.toLowerCase();
    if (tag.startsWith('zh')) return 'zh';
    if (tag.startsWith('fr')) return 'fr';
    if (tag.startsWith('en')) return 'en';
  }
  return DEFAULT_LANG;
}

function interpolate(template: string, vars?: TranslationVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/**
 * Looks a key up in the given language, falling back to English so a missing
 * translation degrades to readable text rather than a raw key.
 */
export function translate(
  lang: Lang,
  key: TranslationKey,
  vars?: TranslationVars,
): string {
  const template = dictionaries[lang][key] ?? en[key] ?? key;
  return interpolate(template, vars);
}
