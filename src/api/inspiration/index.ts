import { createId } from '../../lib/id';
import { isSupportedCountry } from '../../data/countries';
import type { Lang } from '../../i18n';
import type { RecipeCategory, RecipeDraft } from '../../types/recipe';
import { wikibooks, mapWikibooksCategory } from './wikibooks';
import type { ExternalRecipe, InspirationProvider } from './types';

export * from './types';

/**
 * The single place the inspiration source is chosen. Swapping Wikibooks for
 * another API — or a bundled offline dataset — means changing this line.
 */
export const inspirationProvider: InspirationProvider = wikibooks;

/**
 * Converts an external recipe into a draft for the normal recipe form.
 *
 * Nothing is saved here. The draft goes to the same review screen as a
 * Markdown import, so the user always sees what is about to enter their book.
 */
export function externalToDraft(
  external: ExternalRecipe,
  localizedNames?: Partial<Record<Lang, string>>,
): RecipeDraft {
  const countryCode = isSupportedCountry(external.countryCode)
    ? external.countryCode
    : null;

  return {
    name: external.name,
    ...(localizedNames ? { localizedNames } : {}),
    category: mapWikibooksCategory(external.category) as RecipeCategory,
    occasion: 'normal',
    ingredients:
      external.ingredients.length > 0
        ? external.ingredients.map((item) => ({
            id: createId('i'),
            name: item.name,
            optional: false,
            ...(item.measure ? { quantity: item.measure } : {}),
          }))
        : [{ id: createId('i'), name: '', optional: false }],
    seasonings: [],
    // The source has no cooking time, so this stays empty for the user to fill.
    durationMinutes: external.durationMinutes ? String(external.durationMinutes) : '',
    cuisineType: countryCode ? 'country' : 'home',
    cuisineCountry: countryCode,
    instructions: external.instructions,
    notes: '',
    source: {
      kind: 'wikibooks',
      ref: external.id,
      ...(external.sourceUrl ? { url: external.sourceUrl } : {}),
    },
  };
}
