import {
  InspirationUnavailableError,
  type ExternalRecipe,
  type ExternalSummary,
  type InspirationFilters,
  type InspirationProvider,
} from './types';

/**
 * TheMealDB adapter.
 *
 * Free, public, CORS-friendly, and the only network call this app ever makes.
 * Everything it returns is treated as untrusted display data.
 */

const BASE = 'https://www.themealdb.com/api/json/v1/1';

/** Their area labels mapped onto our country whitelist. Unknown stays null. */
const AREA_TO_COUNTRY: Record<string, string> = {
  american: 'us',
  british: 'gb',
  canadian: 'ca',
  chinese: 'cn',
  croatian: 'hr',
  dutch: 'nl',
  egyptian: 'eg',
  filipino: 'ph',
  french: 'fr',
  greek: 'gr',
  indian: 'in',
  irish: 'ie',
  italian: 'it',
  jamaican: 'jm',
  japanese: 'jp',
  kenyan: 'ke',
  malaysian: 'my',
  mexican: 'mx',
  moroccan: 'ma',
  polish: 'pl',
  portuguese: 'pt',
  russian: 'ru',
  spanish: 'es',
  thai: 'th',
  tunisian: 'tn',
  turkish: 'tr',
  ukrainian: 'ua',
  uruguayan: 'uy',
  vietnamese: 'vn',
};

/** Their category labels mapped onto ours, for the pre-filled import form. */
const CATEGORY_MAP: Record<string, string> = {
  beef: 'main',
  chicken: 'main',
  lamb: 'main',
  pork: 'main',
  goat: 'main',
  seafood: 'main',
  pasta: 'main',
  vegan: 'main',
  vegetarian: 'main',
  miscellaneous: 'other',
  breakfast: 'other',
  dessert: 'dessert',
  starter: 'appetizer',
  side: 'appetizer',
};

interface MealRow {
  idMeal: string;
  strMeal: string;
  strMealThumb?: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strSource?: string;
  strYoutube?: string;
  strTags?: string;
  [key: string]: string | undefined;
}

const cache = new Map<string, unknown>();

async function fetchJson<T>(path: string): Promise<T> {
  const cached = cache.get(path);
  if (cached !== undefined) return cached as T;

  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' } });
  } catch (error) {
    throw new InspirationUnavailableError(error);
  }
  if (!response.ok) throw new InspirationUnavailableError(response.status);

  let data: T;
  try {
    data = (await response.json()) as T;
  } catch (error) {
    throw new InspirationUnavailableError(error);
  }
  // Random draws must stay random, so they are never cached.
  if (!path.startsWith('/random')) cache.set(path, data);
  return data;
}

function toSummary(row: MealRow): ExternalSummary {
  return {
    id: row.idMeal,
    name: row.strMeal,
    sourceLanguage: 'en',
    thumbnail: row.strMealThumb,
  };
}

function toRecipe(row: MealRow): ExternalRecipe {
  const ingredients = [];
  for (let index = 1; index <= 20; index += 1) {
    const name = row[`strIngredient${index}`]?.trim();
    if (!name) continue;
    const measure = row[`strMeasure${index}`]?.trim();
    ingredients.push({ name, measure: measure || undefined });
  }

  const area = row.strArea?.trim();
  return {
    id: row.idMeal,
    name: row.strMeal,
    sourceLanguage: 'en',
    category: row.strCategory?.trim() || undefined,
    area: area || undefined,
    countryCode: area ? (AREA_TO_COUNTRY[area.toLowerCase()] ?? null) : null,
    thumbnail: row.strMealThumb,
    instructions: (row.strInstructions ?? '').replace(/\r\n/g, '\n').trim(),
    ingredients,
    sourceUrl: row.strSource?.trim() || undefined,
    videoUrl: row.strYoutube?.trim() || undefined,
    tags: (row.strTags ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    // TheMealDB publishes no cooking time. We do not invent one.
    durationMinutes: null,
  };
}

/** Our category id for a TheMealDB category label. */
export function mapCategory(label: string | undefined): string {
  if (!label) return 'main';
  return CATEGORY_MAP[label.toLowerCase()] ?? 'main';
}

export const theMealDb: InspirationProvider = {
  id: 'themealdb',
  name: 'TheMealDB',
  homepage: 'https://www.themealdb.com',

  async listAreas() {
    const data = await fetchJson<{ meals: { strArea: string }[] | null }>(
      '/list.php?a=list',
    );
    return (data.meals ?? []).map((row) => row.strArea).filter(Boolean).sort();
  },

  async listCategories() {
    const data = await fetchJson<{ meals: { strCategory: string }[] | null }>(
      '/list.php?c=list',
    );
    return (data.meals ?? []).map((row) => row.strCategory).filter(Boolean).sort();
  },

  async findCandidates(filters: InspirationFilters) {
    // The API takes exactly one filter per request, so several filters mean
    // several requests intersected on the client.
    const requests: Promise<ExternalSummary[]>[] = [];
    if (filters.ingredient?.trim()) {
      const value = encodeURIComponent(filters.ingredient.trim().replace(/\s+/g, '_'));
      requests.push(filterRequest(`/filter.php?i=${value}`));
    }
    if (filters.area) {
      requests.push(filterRequest(`/filter.php?a=${encodeURIComponent(filters.area)}`));
    }
    if (filters.category) {
      requests.push(filterRequest(`/filter.php?c=${encodeURIComponent(filters.category)}`));
    }
    if (requests.length === 0) return [];

    const results = await Promise.all(requests);
    const [first, ...rest] = results;
    return rest.reduce((accumulator, list) => {
      const ids = new Set(list.map((item) => item.id));
      return accumulator.filter((item) => ids.has(item.id));
    }, first);
  },

  async getById(id: string) {
    const data = await fetchJson<{ meals: MealRow[] | null }>(
      `/lookup.php?i=${encodeURIComponent(id)}`,
    );
    const row = data.meals?.[0];
    return row ? toRecipe(row) : null;
  },

  async getRandom(count: number) {
    const draws = await Promise.all(
      Array.from({ length: Math.max(1, count) }, () =>
        fetchJson<{ meals: MealRow[] | null }>('/random.php'),
      ),
    );
    const seen = new Set<string>();
    const recipes: ExternalRecipe[] = [];
    for (const draw of draws) {
      const row = draw.meals?.[0];
      if (!row || seen.has(row.idMeal)) continue;
      seen.add(row.idMeal);
      recipes.push(toRecipe(row));
    }
    return recipes;
  },
};

async function filterRequest(path: string): Promise<ExternalSummary[]> {
  const data = await fetchJson<{ meals: MealRow[] | null }>(path);
  return (data.meals ?? []).map(toSummary);
}
