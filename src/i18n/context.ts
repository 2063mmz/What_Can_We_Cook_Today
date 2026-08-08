import { createContext, useContext } from 'react';
import type { Lang, TranslationKey, TranslationVars } from './index';

/**
 * The context and its hook live apart from the provider component so that a
 * single module never exports both a component and a hook — that split is what
 * keeps Fast Refresh working during development.
 */
export interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: TranslationVars) => string;
  /** Intl locale tag, for dates and number formatting. */
  locale: string;
}

export const I18nContext = createContext<I18nValue | null>(null);

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside <I18nProvider>');
  return value;
}
