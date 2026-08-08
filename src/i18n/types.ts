import type { en } from './en';

/** Every language the interface is available in. English is the default. */
export const LANGUAGES = ['en', 'zh', 'fr'] as const;
export type Lang = (typeof LANGUAGES)[number];

/** Short label used by the header switcher. Not translated — it names itself. */
export const LANG_LABELS: Record<Lang, string> = {
  en: 'EN',
  zh: '中文',
  fr: 'FR',
};

/** BCP 47 tags, used for `<html lang>` and date formatting. */
export const LANG_TAGS: Record<Lang, string> = {
  en: 'en',
  zh: 'zh-Hans',
  fr: 'fr',
};

export type TranslationKey = keyof typeof en;

/**
 * A complete dictionary. Adding a key to `en` makes TypeScript demand it in
 * every other language file, so translations can never silently drift.
 */
export type Dictionary = Record<TranslationKey, string>;

/** Values that can be substituted into a {placeholder}. */
export type TranslationVars = Record<string, string | number>;
