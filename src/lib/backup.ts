import {
  RECIPE_CATEGORIES,
  RECIPE_OCCASIONS,
  type Recipe,
  type RecipeCategory,
  type RecipeOccasion,
} from '../types/recipe';
import { isSupportedCountry } from '../data/countries';
import { createId } from './id';

/**
 * Lossless JSON backup. Markdown is the readable, editable format; this is the
 * one that round-trips a whole collection byte for byte.
 */

const APP_TAG = 'what-can-we-cook-today';
const BACKUP_VERSION = 1;

interface BackupFile {
  app: string;
  version: number;
  exportedAt: string;
  recipes: Recipe[];
}

export function recipesToJson(recipes: readonly Recipe[]): string {
  const backup: BackupFile = {
    app: APP_TAG,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    recipes: [...recipes],
  };
  return `${JSON.stringify(backup, null, 2)}\n`;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asEnum<T extends string>(
  value: unknown,
  options: readonly T[],
  fallback: T,
): T {
  return typeof value === 'string' && (options as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function localizedNames(value: unknown): Recipe['localizedNames'] {
  if (typeof value !== 'object' || value === null) return undefined;
  const record = value as Record<string, unknown>;
  const names = Object.fromEntries(
    (['en', 'zh', 'fr'] as const)
      .map((lang) => [lang, asString(record[lang]).trim()] as const)
      .filter(([, name]) => Boolean(name)),
  );
  return Object.keys(names).length > 0 ? names : undefined;
}

/** Validates an untrusted backup file field by field. Never trusts its shape. */
export function parseBackupJson(text: string): Recipe[] | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }

  const rows = Array.isArray(data)
    ? data
    : ((data as BackupFile | null)?.recipes ?? null);
  if (!Array.isArray(rows)) return null;

  const now = new Date().toISOString();
  const recipes: Recipe[] = [];

  for (const row of rows) {
    if (typeof row !== 'object' || row === null) continue;
    const record = row as Record<string, unknown>;
    const name = asString(record.name).trim();
    if (!name) continue;

    const country = asString(record.cuisineCountry).toLowerCase() || null;
    const cuisineType = asEnum(record.cuisineType, ['home', 'country'] as const, 'home');

    recipes.push({
      id: asString(record.id) || createId(),
      name,
      ...(localizedNames(record.localizedNames)
        ? { localizedNames: localizedNames(record.localizedNames) }
        : {}),
      category: asEnum<RecipeCategory>(record.category, RECIPE_CATEGORIES, 'main'),
      occasion: asEnum<RecipeOccasion>(record.occasion, RECIPE_OCCASIONS, 'normal'),
      ingredients: Array.isArray(record.ingredients)
        ? record.ingredients
            .filter((item): item is Record<string, unknown> =>
              typeof item === 'object' && item !== null,
            )
            .map((item) => ({
              id: asString(item.id) || createId('i'),
              name: asString(item.name).trim(),
              optional: item.optional === true,
              ...(asString(item.quantity) ? { quantity: asString(item.quantity) } : {}),
            }))
            .filter((item) => item.name)
        : [],
      seasonings: Array.isArray(record.seasonings)
        ? record.seasonings
            .filter((item): item is Record<string, unknown> =>
              typeof item === 'object' && item !== null,
            )
            .map((item) => ({
              id: asString(item.id) || createId('s'),
              name: asString(item.name).trim(),
              ...(asString(item.quantity) ? { quantity: asString(item.quantity) } : {}),
            }))
            .filter((item) => item.name)
        : [],
      durationMinutes:
        typeof record.durationMinutes === 'number' && record.durationMinutes > 0
          ? Math.round(record.durationMinutes)
          : 0,
      cuisineType,
      cuisineCountry:
        cuisineType === 'country' && isSupportedCountry(country) ? country : null,
      instructions: asString(record.instructions),
      notes: asString(record.notes),
      ...(asString(record.emoji) ? { emoji: asString(record.emoji) } : {}),
      ...(typeof record.source === 'object' && record.source !== null
        ? {
            source: {
              kind: asEnum(
                (record.source as Record<string, unknown>).kind,
                ['manual', 'markdown', 'themealdb', 'wikibooks'] as const,
                'manual',
              ),
              ...(asString((record.source as Record<string, unknown>).ref)
                ? { ref: asString((record.source as Record<string, unknown>).ref) }
                : {}),
              ...(asString((record.source as Record<string, unknown>).url)
                ? { url: asString((record.source as Record<string, unknown>).url) }
                : {}),
            },
          }
        : {}),
      createdAt: asString(record.createdAt) || now,
      updatedAt: asString(record.updatedAt) || now,
    });
  }

  return recipes.length > 0 ? recipes : null;
}
