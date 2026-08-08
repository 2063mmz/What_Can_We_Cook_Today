import { HOME_COOKING_ICON, getCountry } from '../data/countries';
import type { Lang, TranslationKey, TranslationVars } from '../i18n';
import type { Recipe, RecipeOccasion } from '../types/recipe';

type Translate = (key: TranslationKey, vars?: TranslationVars) => string;

/** The icon shown next to each occasion. Never the only carrier of meaning. */
export const OCCASION_ICONS: Record<RecipeOccasion, string> = {
  weekday_quick: '⚡',
  normal: '🏠',
  formal: '🍽',
  weekend: '🌤',
};

export interface CuisineLabel {
  icon: string;
  /** Country name in the interface language, or the home-cooking label. */
  text: string;
}

/**
 * Home cooking is 🏠 with no country. A country cuisine shows its flag from
 * the explicit whitelist — flags are never generated from arbitrary input.
 */
export function cuisineLabel(
  recipe: Pick<Recipe, 'cuisineType' | 'cuisineCountry'>,
  lang: Lang,
  t: Translate,
): CuisineLabel {
  if (recipe.cuisineType === 'country') {
    const country = getCountry(recipe.cuisineCountry);
    if (country) return { icon: country.flag, text: country.names[lang] };
  }
  return { icon: HOME_COOKING_ICON, text: t('cuisine.home') };
}

/** A formatted date for the recipe detail page. */
export function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

/** Joins a list of names with the language's own separator. */
export function joinNames(names: readonly string[], lang: Lang): string {
  return names.join(lang === 'zh' ? '、' : ', ');
}
