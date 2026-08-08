import { createId } from './id';
import type {
  Ingredient,
  Recipe,
  RecipeDraft,
  Seasoning,
} from '../types/recipe';
import type { TranslationKey, TranslationVars } from '../i18n';

type Translate = (key: TranslationKey, vars?: TranslationVars) => string;

export function emptyIngredient(): Ingredient {
  return { id: createId('i'), name: '', optional: false };
}

export function emptySeasoning(): Seasoning {
  return { id: createId('s'), name: '' };
}

export function emptyDraft(): RecipeDraft {
  return {
    name: '',
    category: 'main',
    occasion: 'normal',
    ingredients: [emptyIngredient()],
    seasonings: [emptySeasoning()],
    durationMinutes: '30',
    cuisineType: 'home',
    cuisineCountry: null,
    instructions: '',
    notes: '',
    source: { kind: 'manual' },
  };
}

export function recipeToDraft(recipe: Recipe): RecipeDraft {
  return {
    id: recipe.id,
    name: recipe.name,
    localizedNames: recipe.localizedNames,
    category: recipe.category,
    occasion: recipe.occasion,
    ingredients:
      recipe.ingredients.length > 0
        ? recipe.ingredients.map((item) => ({ ...item }))
        : [emptyIngredient()],
    seasonings: recipe.seasonings.map((item) => ({ ...item })),
    durationMinutes: recipe.durationMinutes ? String(recipe.durationMinutes) : '',
    cuisineType: recipe.cuisineType,
    cuisineCountry: recipe.cuisineCountry,
    instructions: recipe.instructions,
    notes: recipe.notes,
    emoji: recipe.emoji,
    source: recipe.source,
    createdAt: recipe.createdAt,
  };
}

/** Turns a validated draft into the record that gets stored. */
export function draftToRecipe(draft: RecipeDraft): Recipe {
  const now = new Date().toISOString();
  return {
    id: draft.id ?? createId(),
    name: draft.name.trim(),
    ...(draft.localizedNames ? { localizedNames: draft.localizedNames } : {}),
    category: draft.category,
    occasion: draft.occasion,
    ingredients: draft.ingredients
      .filter((item) => item.name.trim())
      .map((item) => ({
        id: item.id,
        name: item.name.trim(),
        optional: item.optional,
        ...(item.quantity?.trim() ? { quantity: item.quantity.trim() } : {}),
      })),
    seasonings: draft.seasonings
      .filter((item) => item.name.trim())
      .map((item) => ({
        id: item.id,
        name: item.name.trim(),
        ...(item.quantity?.trim() ? { quantity: item.quantity.trim() } : {}),
      })),
    durationMinutes: Number.parseInt(draft.durationMinutes, 10) || 0,
    cuisineType: draft.cuisineType,
    cuisineCountry: draft.cuisineType === 'country' ? draft.cuisineCountry : null,
    instructions: draft.instructions.trim(),
    notes: draft.notes.trim(),
    ...(draft.emoji ? { emoji: draft.emoji } : {}),
    ...(draft.source ? { source: draft.source } : {}),
    createdAt: draft.createdAt ?? now,
    updatedAt: now,
  };
}

export type DraftErrors = Partial<
  Record<'name' | 'ingredients' | 'duration' | 'country', TranslationKey>
>;

export function validateDraft(draft: RecipeDraft): DraftErrors {
  const errors: DraftErrors = {};
  if (!draft.name.trim()) errors.name = 'form.errorName';
  if (!draft.ingredients.some((item) => item.name.trim())) {
    errors.ingredients = 'form.errorIngredients';
  }
  const minutes = Number.parseInt(draft.durationMinutes, 10);
  if (!Number.isFinite(minutes) || minutes <= 0) errors.duration = 'form.errorDuration';
  if (draft.cuisineType === 'country' && !draft.cuisineCountry) {
    errors.country = 'form.errorCountry';
  }
  return errors;
}

/** "45 min", "1 h 10", "2 h" — or an honest "not set" for unknown durations. */
export function formatDuration(minutes: number, t: Translate): string {
  if (!minutes || minutes <= 0) return t('common.noTime');
  if (minutes < 60) return t('common.minutes', { count: minutes });
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return t('common.hours', { hours });
  return t('common.hoursMinutes', { hours, minutes: rest });
}

/** A filename-safe version of a recipe name, keeping CJK characters intact. */
export function toFileSlug(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
  return cleaned || 'recipe';
}

/** The cached title for the interface language, falling back to the original. */
export function recipeDisplayName(
  recipe: Pick<Recipe, 'name' | 'localizedNames'>,
  lang: 'en' | 'zh' | 'fr',
): string {
  return recipe.localizedNames?.[lang]?.trim() || recipe.name;
}
