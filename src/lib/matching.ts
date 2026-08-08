import { isPantryStaple } from '../data/pantry';
import type { Recipe, RecipeOccasion } from '../types/recipe';
import { namesMatch } from './normalize';
import { pickWeighted } from './random';

/**
 * The recommendation engine.
 *
 *   Recipe library
 *     -> occasion filter
 *     -> duration filter
 *     -> ingredient scoring
 *     -> candidate pool (ready / almost there)
 *     -> weighted random
 *     -> tonight's dinner
 *
 * It is plain, inspectable filtering. There is no model and no server call,
 * and the score below is an ingredient count — never presented as confidence.
 */

/** A recipe may be short this many required ingredients and still be offered. */
export const ALMOST_THRESHOLD = 2;

export interface TonightFilters {
  /** Ingredient names the user says they have. Empty means "no constraint". */
  ingredients: string[];
  /** Minutes, or null for no limit. */
  maxMinutes: number | null;
  /** null means any kind of dinner. */
  occasion: RecipeOccasion | null;
}

export interface ScoredRecipe {
  recipe: Recipe;
  /** Required, non-staple ingredients the user did not tick. */
  missing: string[];
  /** 0–1 over required non-staple ingredients. 1 when nothing is required. */
  score: number;
  matchedCount: number;
  requiredCount: number;
  /** False when no ingredients were selected, so the score means nothing. */
  scoreApplies: boolean;
}

export interface TonightPools {
  /** Every required ingredient is available. */
  ready: ScoredRecipe[];
  /** Short by one or two required ingredients. */
  almost: ScoredRecipe[];
  /** Passed the other filters but needs a real shop. */
  outOfReach: ScoredRecipe[];
  /** How many recipes each filter removed, for an honest empty state. */
  rejected: { occasion: number; time: number; ingredients: number };
  /** Size of the whole library. */
  total: number;
}

/** The required ingredients that actually count — staples are free. */
function requiredIngredients(recipe: Recipe): string[] {
  return recipe.ingredients
    .filter((ingredient) => !ingredient.optional)
    .map((ingredient) => ingredient.name.trim())
    .filter((name) => name.length > 0 && !isPantryStaple(name));
}

function passesOccasion(recipe: Recipe, occasion: RecipeOccasion | null): boolean {
  return occasion === null || recipe.occasion === occasion;
}

function passesTime(recipe: Recipe, maxMinutes: number | null): boolean {
  if (maxMinutes === null) return true;
  // A recipe with no recorded duration is not excluded — we don't invent one.
  if (!recipe.durationMinutes) return true;
  return recipe.durationMinutes <= maxMinutes;
}

/** Scores one recipe against the ingredients the user has. */
export function scoreRecipe(recipe: Recipe, available: string[]): ScoredRecipe {
  const required = requiredIngredients(recipe);
  const scoreApplies = available.length > 0;

  if (!scoreApplies || required.length === 0) {
    return {
      recipe,
      missing: [],
      score: 1,
      matchedCount: required.length,
      requiredCount: required.length,
      scoreApplies: scoreApplies && required.length > 0,
    };
  }

  const missing = required.filter(
    (name) => !available.some((have) => namesMatch(have, name)),
  );
  const matchedCount = required.length - missing.length;

  return {
    recipe,
    missing,
    score: matchedCount / required.length,
    matchedCount,
    requiredCount: required.length,
    scoreApplies: true,
  };
}

/** Runs the whole pipeline and returns the grouped candidate pools. */
export function buildPools(
  recipes: readonly Recipe[],
  filters: TonightFilters,
): TonightPools {
  const available = filters.ingredients
    .map((name) => name.trim())
    .filter(Boolean);

  const rejected = { occasion: 0, time: 0, ingredients: 0 };
  const survivors: Recipe[] = [];

  for (const recipe of recipes) {
    if (!passesOccasion(recipe, filters.occasion)) {
      rejected.occasion += 1;
      continue;
    }
    if (!passesTime(recipe, filters.maxMinutes)) {
      rejected.time += 1;
      continue;
    }
    survivors.push(recipe);
  }

  const ready: ScoredRecipe[] = [];
  const almost: ScoredRecipe[] = [];
  const outOfReach: ScoredRecipe[] = [];

  for (const recipe of survivors) {
    const scored = scoreRecipe(recipe, available);
    if (scored.missing.length === 0) {
      ready.push(scored);
    } else if (scored.missing.length <= ALMOST_THRESHOLD) {
      almost.push(scored);
      rejected.ingredients += 1;
    } else {
      outOfReach.push(scored);
      rejected.ingredients += 1;
    }
  }

  const byScore = (a: ScoredRecipe, b: ScoredRecipe) =>
    b.score - a.score || a.recipe.durationMinutes - b.recipe.durationMinutes;

  return {
    ready: ready.sort(byScore),
    almost: almost.sort(byScore),
    outOfReach: outOfReach.sort(byScore),
    rejected,
    total: recipes.length,
  };
}

/**
 * Weighted random pick over the candidate pool.
 *
 * Better ingredient matches are favoured, recently suggested dishes are
 * damped so the app doesn't offer the same thing every night, and an
 * explicitly excluded recipe (the current one, on "roll again") is skipped
 * whenever there is anything else to choose.
 */
export function pickWinner(
  pool: readonly ScoredRecipe[],
  options: { recentIds?: readonly string[]; excludeId?: string } = {},
): ScoredRecipe | undefined {
  if (pool.length === 0) return undefined;

  const { recentIds = [], excludeId } = options;
  const choices =
    excludeId && pool.length > 1
      ? pool.filter((item) => item.recipe.id !== excludeId)
      : [...pool];

  return pickWeighted(choices, (item) => {
    const base = (0.35 + item.score) ** 2;
    const recentIndex = recentIds.indexOf(item.recipe.id);
    // Most recent pick is damped hardest, older ones progressively less.
    const recency = recentIndex === -1 ? 1 : 0.15 + 0.15 * recentIndex;
    return base * recency;
  });
}

/* --- Full menu (starter + main + dessert) --------------------------------- */

export interface Menu {
  starter?: ScoredRecipe;
  main: ScoredRecipe;
  dessert?: ScoredRecipe;
  totalMinutes: number;
}

const STARTER_CATEGORIES = new Set(['appetizer', 'salad', 'soup']);

/**
 * Builds a three-course menu around an already-chosen main.
 *
 * Only ever draws from the same candidate pool, so every course respects the
 * filters the user set. Returns undefined when there isn't enough to make a
 * menu worth showing — the single main course is a perfectly good answer.
 */
export function buildMenu(
  main: ScoredRecipe,
  pool: readonly ScoredRecipe[],
  options: { recentIds?: readonly string[] } = {},
): Menu | undefined {
  const others = pool.filter((item) => item.recipe.id !== main.recipe.id);
  const starters = others.filter((item) =>
    STARTER_CATEGORIES.has(item.recipe.category),
  );
  const desserts = others.filter((item) => item.recipe.category === 'dessert');
  if (starters.length === 0 && desserts.length === 0) return undefined;

  const starter = pickWinner(starters, options);
  const dessert = pickWinner(desserts, options);
  const totalMinutes = [starter, main, dessert].reduce(
    (sum, course) => sum + (course?.recipe.durationMinutes ?? 0),
    0,
  );

  return { starter, main, dessert, totalMinutes };
}

/* --- Ingredient inventory -------------------------------------------------- */

export interface IngredientOption {
  /** The spelling shown to the user — the most common one in their recipes. */
  name: string;
  /** Normalised key used for de-duplication. */
  key: string;
  /** How many recipes use it, used to order the chips. */
  count: number;
}

/**
 * Collects every ingredient that appears anywhere in the library, so the user
 * never has to type their whole kitchen. Staples are left out of the chips —
 * they don't affect matching, so ticking them would be busywork.
 */
export function collectIngredients(
  recipes: readonly Recipe[],
  extras: readonly string[] = [],
): IngredientOption[] {
  const seen = new Map<string, IngredientOption>();

  const add = (rawName: string) => {
    const name = rawName.trim();
    if (!name || isPantryStaple(name)) return;
    const key = name.toLocaleLowerCase();
    const existing = seen.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      seen.set(key, { name, key, count: 1 });
    }
  };

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) add(ingredient.name);
  }
  for (const extra of extras) add(extra);

  return [...seen.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
}
