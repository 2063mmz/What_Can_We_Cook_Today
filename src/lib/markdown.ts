import { COUNTRIES, isSupportedCountry } from '../data/countries';
import { createId } from './id';
import { normalizeName } from './normalize';
import {
  RECIPE_CATEGORIES,
  RECIPE_OCCASIONS,
  type Ingredient,
  type Recipe,
  type RecipeCategory,
  type RecipeDraft,
  type RecipeOccasion,
  type Seasoning,
} from '../types/recipe';

/**
 * The Markdown recipe format.
 *
 * Export is strict and always identical, so files written by this app can
 * always be read back. Import is deliberately forgiving: localized headings,
 * missing front matter and unknown fields are all tolerated, because the
 * second supported case is "a file a person wrote by hand".
 *
 *   ---
 *   name: Tomato and egg
 *   category: main
 *   occasion: weekday_quick
 *   duration: 15
 *   cuisine: home
 *   ---
 *
 *   # Tomato and egg
 *
 *   ## Ingredients
 *   - Tomato (2)
 *   - Egg (3)
 *   - Spring onion (optional)
 *
 *   ## Seasonings
 *   - Salt
 *
 *   ## Instructions
 *   1. Beat the eggs.
 *
 *   ## Notes
 *   Better with a little sugar.
 */

/** Separates recipes inside a multi-recipe export. */
export const BUNDLE_SEPARATOR = '<!-- what-can-we-cook-today:recipe -->';
const LEGACY_BUNDLE_SEPARATOR = '<!-- what-i-eat-tonight:recipe -->';

export type ParsedField =
  | 'name'
  | 'category'
  | 'occasion'
  | 'duration'
  | 'cuisine'
  | 'ingredients';

export interface ParsedRecipe {
  draft: RecipeDraft;
  /** Fields that could not be read and were left empty or at a default. */
  unresolved: ParsedField[];
}

/* --- Serialising ---------------------------------------------------------- */

function quoteIfNeeded(value: string): string {
  return /^[\s'"]|[:#]|\s$/.test(value) ? JSON.stringify(value) : value;
}

function ingredientLine(item: Ingredient | Seasoning, optional = false): string {
  const parts: string[] = [];
  if (item.quantity?.trim()) parts.push(item.quantity.trim());
  if (optional) parts.push('optional');
  const suffix = parts.length > 0 ? ` (${parts.join(', ')})` : '';
  return `- ${item.name.trim()}${suffix}`;
}

/** One recipe as a self-contained Markdown document. */
export function recipeToMarkdown(recipe: Recipe): string {
  const front: string[] = [
    `name: ${quoteIfNeeded(recipe.name)}`,
    `category: ${recipe.category}`,
    `occasion: ${recipe.occasion}`,
    `duration: ${recipe.durationMinutes || ''}`,
    `cuisine: ${recipe.cuisineType}`,
  ];
  if (recipe.cuisineType === 'country' && recipe.cuisineCountry) {
    front.push(`country: ${recipe.cuisineCountry}`);
  }
  if (recipe.emoji) front.push(`emoji: ${recipe.emoji}`);
  for (const lang of ['en', 'zh', 'fr'] as const) {
    const translated = recipe.localizedNames?.[lang]?.trim();
    if (translated) front.push(`name_${lang}: ${quoteIfNeeded(translated)}`);
  }

  const blocks: string[] = [
    `---\n${front.join('\n')}\n---`,
    `# ${recipe.name}`,
  ];

  const required = recipe.ingredients.filter((item) => item.name.trim());
  if (required.length > 0) {
    blocks.push(
      `## Ingredients\n${required
        .map((item) => ingredientLine(item, item.optional))
        .join('\n')}`,
    );
  }

  const seasonings = recipe.seasonings.filter((item) => item.name.trim());
  if (seasonings.length > 0) {
    blocks.push(
      `## Seasonings\n${seasonings.map((item) => ingredientLine(item)).join('\n')}`,
    );
  }

  const steps = recipe.instructions
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (steps.length > 0) {
    blocks.push(
      `## Instructions\n${steps
        .map((step, index) => `${index + 1}. ${stripListMarker(step)}`)
        .join('\n')}`,
    );
  }

  if (recipe.notes.trim()) {
    blocks.push(`## Notes\n${recipe.notes.trim()}`);
  }

  return `${blocks.join('\n\n')}\n`;
}

/** Every recipe in one file, still readable and still re-importable. */
export function recipesToMarkdownBundle(recipes: readonly Recipe[]): string {
  return recipes
    .map((recipe) => `${BUNDLE_SEPARATOR}\n\n${recipeToMarkdown(recipe)}`)
    .join('\n');
}

/* --- Parsing -------------------------------------------------------------- */

type SectionKind = 'ingredients' | 'seasonings' | 'instructions' | 'notes';

/** Heading aliases, normalised. Covers the three interface languages. */
const SECTION_ALIASES: Record<SectionKind, string[]> = {
  ingredients: ['ingredients', 'ingredient', 'ingredients list', '食材', '材料', '用料', '配料'],
  seasonings: ['seasonings', 'seasoning', 'spices', '调料', '调味料', '佐料', '配调料', 'assaisonnements', 'assaisonnement', 'epices'],
  instructions: ['instructions', 'instruction', 'steps', 'method', 'directions', 'preparation', '做法', '步骤', '制作', '制作方法', 'etapes', 'preparation'],
  notes: ['notes', 'note', 'tips', '备注', '笔记', '小贴士', '提示', 'remarques', 'remarque'],
};

const OPTIONAL_WORDS = new Set(
  ['optional', 'opt', 'facultatif', 'optionnel', '可选', '可省略', '选用'].map(
    normalizeName,
  ),
);

function headingKind(text: string): SectionKind | null {
  const key = normalizeName(text);
  for (const [kind, aliases] of Object.entries(SECTION_ALIASES) as [
    SectionKind,
    string[],
  ][]) {
    if (aliases.some((alias) => normalizeName(alias) === key)) return kind;
  }
  return null;
}

function stripListMarker(line: string): string {
  return line.replace(/^\s*(?:[-*+•]|\d+[.)])\s*/, '').trim();
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 1) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length > 1)
  ) {
    try {
      return JSON.parse(trimmed.replace(/^'|'$/g, '"')) as string;
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
}

/** Reads `key: value` front matter. Nested YAML is not supported by design. */
function parseFrontMatter(source: string): {
  fields: Record<string, string>;
  body: string;
} {
  const match = /^﻿?\s*---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/.exec(source);
  if (!match) return { fields: {}, body: source };

  const fields: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = normalizeName(line.slice(0, separator));
    if (key) fields[key] = unquote(line.slice(separator + 1));
  }
  return { fields, body: source.slice(match[0].length) };
}

/** Matches a value against canonical ids first, then any localized label. */
function resolveEnum<T extends string>(
  value: string | undefined,
  options: readonly T[],
  labelLookup: Record<string, T>,
): T | null {
  if (!value) return null;
  const key = normalizeName(value);
  if (!key) return null;
  const direct = options.find((option) => normalizeName(option) === key);
  if (direct) return direct;
  return labelLookup[key] ?? null;
}

/** Localized words a hand-written file might use for category and occasion. */
const CATEGORY_LABELS: Record<string, RecipeCategory> = {};
const OCCASION_LABELS: Record<string, RecipeOccasion> = {};
{
  const categoryWords: Array<[RecipeCategory, string[]]> = [
    ['main', ['main', 'main course', 'main dish', 'plat', 'plat principal', '主菜', '主食']],
    ['appetizer', ['appetizer', 'appetiser', 'starter', 'entree', 'entrée', '前菜', '开胃菜', '小菜']],
    ['salad', ['salad', 'salade', '沙拉', '凉拌']],
    ['soup', ['soup', 'soupe', 'potage', '汤', '汤类']],
    ['dessert', ['dessert', '甜点', '甜品']],
    ['snack', ['snack', 'en cas', 'encas', '小食', '零食', '点心']],
    ['other', ['other', 'autre', '其他', '其它']],
  ];
  for (const [id, words] of categoryWords) {
    for (const word of words) CATEGORY_LABELS[normalizeName(word)] = id;
  }

  const occasionWords: Array<[RecipeOccasion, string[]]> = [
    ['weekday_quick', ['weekday quick', 'quick', 'weekday', 'quick weekday meal', 'rapide', 'repas rapide en semaine', '快手菜', '平日快手菜', '快速']],
    ['normal', ['normal', 'normal dinner', 'diner normal', 'dîner normal', '正常晚饭', '正常', '日常']],
    ['formal', ['formal', 'formal dinner', 'diner soigne', 'dîner soigné', '正式的一餐', '正式']],
    ['weekend', ['weekend', 'week end', 'week-end', '周末']],
  ];
  for (const [id, words] of occasionWords) {
    for (const word of words) OCCASION_LABELS[normalizeName(word)] = id;
  }
}

/** Accepts a country code or a country name in any interface language. */
function resolveCountry(value: string | undefined): string | null {
  if (!value) return null;
  const raw = value.trim().toLowerCase();
  if (isSupportedCountry(raw)) return raw;
  const key = normalizeName(value);
  for (const country of COUNTRIES) {
    if (Object.values(country.names).some((name) => normalizeName(name) === key)) {
      return country.code;
    }
  }
  return null;
}

function parseListItem(line: string): {
  name: string;
  quantity?: string;
  optional: boolean;
} {
  const text = stripListMarker(line);
  const match = /^(.*?)[\s]*[（(]([^)）]*)[)）]\s*$/.exec(text);
  if (!match) return { name: text, optional: false };

  const [, name, inside] = match;
  const parts = inside
    .split(/[,，;；]/)
    .map((part) => part.trim())
    .filter(Boolean);

  const remaining: string[] = [];
  let optional = false;
  for (const part of parts) {
    if (OPTIONAL_WORDS.has(normalizeName(part))) optional = true;
    else remaining.push(part);
  }

  // A parenthetical with no number and no "optional" is far more likely to be
  // part of the name ("Tofu (firm)") than a quantity — leave it attached.
  const looksLikeQuantity = remaining.some((part) => /\d/.test(part));
  if (!optional && !looksLikeQuantity) {
    return { name: text, optional: false };
  }

  const quantity = looksLikeQuantity ? remaining.join(', ').trim() : '';
  return { name: name.trim() || text, quantity: quantity || undefined, optional };
}

interface RawSections {
  title: string;
  sections: Partial<Record<SectionKind, string[]>>;
}

function splitSections(body: string): RawSections {
  const lines = body.split(/\r?\n/);
  const sections: Partial<Record<SectionKind, string[]>> = {};
  let title = '';
  let current: SectionKind | null = null;

  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.*)$/.exec(line.trim());
    if (heading) {
      const [, hashes, text] = heading;
      const kind = headingKind(text);
      if (kind) {
        current = kind;
        sections[kind] ??= [];
      } else {
        current = null;
        // The first plain heading (usually `# Name`) is the recipe title.
        if (!title && hashes.length <= 2) title = text.trim();
      }
      continue;
    }
    if (current) (sections[current] ??= []).push(line);
  }

  return { title, sections };
}

function textOf(lines: string[] | undefined): string {
  if (!lines) return '';
  return lines.join('\n').replace(/^\n+|\n+$/g, '').trim();
}

function listOf(lines: string[] | undefined): string[] {
  if (!lines) return [];
  return lines.map((line) => line.trim()).filter(Boolean);
}

/** Parses a single Markdown document into a reviewable draft. */
export function parseRecipeMarkdown(source: string): ParsedRecipe | null {
  const { fields, body } = parseFrontMatter(source);
  const { title, sections } = splitSections(body);
  const unresolved: ParsedField[] = [];

  const name = (fields.name || fields.title || title || '').trim();
  if (!name) unresolved.push('name');

  const category = resolveEnum(
    fields.category,
    RECIPE_CATEGORIES,
    CATEGORY_LABELS,
  );
  if (!category) unresolved.push('category');

  const occasion = resolveEnum(
    fields.occasion,
    RECIPE_OCCASIONS,
    OCCASION_LABELS,
  );
  if (!occasion) unresolved.push('occasion');

  const durationRaw = fields.duration ?? fields.time ?? fields.minutes ?? '';
  const durationMatch = /\d+/.exec(durationRaw);
  const durationMinutes = durationMatch ? durationMatch[0] : '';
  if (!durationMinutes) unresolved.push('duration');

  let cuisineType: 'home' | 'country' = 'home';
  let cuisineCountry: string | null = null;
  const cuisineRaw = fields.cuisine ?? '';
  const countryFromCuisine = resolveCountry(fields.country ?? cuisineRaw);
  if (countryFromCuisine) {
    cuisineType = 'country';
    cuisineCountry = countryFromCuisine;
  } else if (normalizeName(cuisineRaw) && normalizeName(cuisineRaw) !== 'home') {
    // Named something we don't support — keep the recipe, flag the field.
    unresolved.push('cuisine');
  }

  const ingredients: Ingredient[] = listOf(sections.ingredients).map((line) => {
    const parsed = parseListItem(line);
    return {
      id: createId('i'),
      name: parsed.name,
      quantity: parsed.quantity,
      optional: parsed.optional,
    };
  });
  if (ingredients.length === 0) unresolved.push('ingredients');

  const seasonings: Seasoning[] = listOf(sections.seasonings).map((line) => {
    const parsed = parseListItem(line);
    return { id: createId('s'), name: parsed.name, quantity: parsed.quantity };
  });

  const instructions = listOf(sections.instructions)
    .map(stripListMarker)
    .join('\n');
  const notes = textOf(sections.notes);

  // Nothing at all identifiable: not a recipe.
  if (!name && ingredients.length === 0 && !instructions) return null;

  const draft: RecipeDraft = {
    name,
    localizedNames: Object.fromEntries(
      (['en', 'zh', 'fr'] as const)
        .map((lang) => [lang, fields[`name_${lang}`]?.trim()] as const)
        .filter(([, value]) => Boolean(value)),
    ),
    category: category ?? 'main',
    occasion: occasion ?? 'normal',
    ingredients:
      ingredients.length > 0
        ? ingredients
        : [{ id: createId('i'), name: '', optional: false }],
    seasonings,
    durationMinutes,
    cuisineType,
    cuisineCountry,
    instructions,
    notes,
    emoji: fields.emoji?.trim() || undefined,
    source: { kind: 'markdown' },
  };

  return { draft, unresolved };
}

/** Parses a file that may hold one recipe or a whole exported collection. */
export function parseMarkdownFile(source: string): ParsedRecipe[] {
  // Keep old exports importable after the project rename.
  const normalizedSource = source.replaceAll(
    LEGACY_BUNDLE_SEPARATOR,
    BUNDLE_SEPARATOR,
  );
  const chunks = normalizedSource.includes(BUNDLE_SEPARATOR)
    ? normalizedSource.split(BUNDLE_SEPARATOR)
    : [normalizedSource];

  return chunks
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map(parseRecipeMarkdown)
    .filter((parsed): parsed is ParsedRecipe => parsed !== null);
}

/** A ready-to-show example of the format, used on the import screen. */
export const MARKDOWN_EXAMPLE = `---
name: Tomato and egg
category: main
occasion: weekday_quick
duration: 15
cuisine: home
---

# Tomato and egg

## Ingredients
- Tomato (2)
- Egg (3)
- Spring onion (optional)

## Seasonings
- Salt
- Sugar

## Instructions
1. Beat the eggs and fry them softly.
2. Cook the tomatoes until they collapse.
3. Put them back together.

## Notes
A pinch of sugar takes the acidity off.
`;
