import { useSyncExternalStore } from 'react';
import type { Recipe } from '../types/recipe';
import { getAll, putMany, remove, RECIPE_STORE, put } from './idb';

/**
 * A tiny external store so any component can read the recipe collection
 * without prop drilling or a state library. One in-memory cache, one set of
 * listeners, IndexedDB behind it.
 */

export interface RecipeSnapshot {
  status: 'loading' | 'ready' | 'error';
  recipes: Recipe[];
  error: string | null;
}

const EMPTY: Recipe[] = [];

let snapshot: RecipeSnapshot = { status: 'loading', recipes: EMPTY, error: null };
const listeners = new Set<() => void>();
let loadPromise: Promise<void> | null = null;

function emit(next: RecipeSnapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}

function sortRecipes(recipes: Recipe[]): Recipe[] {
  return [...recipes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  void ensureLoaded();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): RecipeSnapshot {
  return snapshot;
}

export function ensureLoaded(): Promise<void> {
  loadPromise ??= getAll<Recipe>(RECIPE_STORE)
    .then((recipes) => {
      emit({ status: 'ready', recipes: sortRecipes(recipes), error: null });
    })
    .catch((error: unknown) => {
      emit({
        status: 'error',
        recipes: EMPTY,
        error: error instanceof Error ? error.message : 'storage error',
      });
    });
  return loadPromise;
}

/** Reactive access to every stored recipe. */
export function useRecipes(): RecipeSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useRecipe(id: string | undefined): Recipe | undefined {
  const { recipes } = useRecipes();
  return id ? recipes.find((recipe) => recipe.id === id) : undefined;
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  await put(RECIPE_STORE, recipe);
  const rest = snapshot.recipes.filter((item) => item.id !== recipe.id);
  emit({ ...snapshot, status: 'ready', recipes: sortRecipes([...rest, recipe]) });
}

export async function saveRecipes(recipes: Recipe[]): Promise<void> {
  if (recipes.length === 0) return;
  await putMany(RECIPE_STORE, recipes);
  const incoming = new Set(recipes.map((recipe) => recipe.id));
  const rest = snapshot.recipes.filter((item) => !incoming.has(item.id));
  emit({ ...snapshot, status: 'ready', recipes: sortRecipes([...rest, ...recipes]) });
}

export async function deleteRecipe(id: string): Promise<void> {
  await remove(RECIPE_STORE, id);
  emit({
    ...snapshot,
    recipes: snapshot.recipes.filter((recipe) => recipe.id !== id),
  });
}
