/**
 * The core domain model. Everything the app stores locally is described here.
 */

export const RECIPE_CATEGORIES = [
  'main',
  'appetizer',
  'salad',
  'soup',
  'dessert',
  'snack',
  'other',
] as const;
export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];

export const RECIPE_OCCASIONS = [
  'weekday_quick',
  'normal',
  'formal',
  'weekend',
] as const;
export type RecipeOccasion = (typeof RECIPE_OCCASIONS)[number];

export const CUISINE_TYPES = ['home', 'country'] as const;
export type CuisineType = (typeof CUISINE_TYPES)[number];

export interface Ingredient {
  id: string;
  name: string;
  /** Optional ingredients never block a recipe from being recommended. */
  optional: boolean;
  /** Free text, e.g. "2 tbsp" or "300g". Never parsed for matching. */
  quantity?: string;
}

export interface Seasoning {
  id: string;
  name: string;
  quantity?: string;
}

/** Where a recipe originally came from. Kept for provenance, never displayed as authority. */
export interface RecipeSource {
  kind: 'manual' | 'markdown' | 'themealdb' | 'wikibooks';
  /** External id or file name. */
  ref?: string;
  url?: string;
}

export interface Recipe {
  id: string;
  name: string;
  /** Cached title translations. The recipe body always remains in its source language. */
  localizedNames?: Partial<Record<'en' | 'zh' | 'fr', string>>;
  category: RecipeCategory;
  occasion: RecipeOccasion;
  ingredients: Ingredient[];
  seasonings: Seasoning[];
  /** 0 means "not specified" — used when an external source has no timing data. */
  durationMinutes: number;
  cuisineType: CuisineType;
  /** ISO 3166-1 alpha-2, lower case. Only set when cuisineType === 'country'. */
  cuisineCountry: string | null;
  instructions: string;
  notes: string;
  /** Small decorative emoji shown on the recipe card. */
  emoji?: string;
  source?: RecipeSource;
  createdAt: string;
  updatedAt: string;
}

/**
 * A recipe being edited. Duration is a string so the form can hold an empty
 * value, and rows carry ids so React keys stay stable while typing.
 */
export interface RecipeDraft {
  id?: string;
  name: string;
  localizedNames?: Partial<Record<'en' | 'zh' | 'fr', string>>;
  category: RecipeCategory;
  occasion: RecipeOccasion;
  ingredients: Ingredient[];
  seasonings: Seasoning[];
  durationMinutes: string;
  cuisineType: CuisineType;
  cuisineCountry: string | null;
  instructions: string;
  notes: string;
  emoji?: string;
  source?: RecipeSource;
  createdAt?: string;
}
