import { looseIncludes, normalizeName } from '../../lib/normalize';
import { shuffle } from '../../lib/random';
import {
  InspirationUnavailableError,
  type ExternalRecipe,
  type ExternalSummary,
  type InspirationFilters,
  type InspirationProvider,
} from './types';

type Edition = 'en';

interface CataloguePage {
  pageid: number;
  title: string;
}

interface CategoryResponse {
  continue?: { cmcontinue?: string };
  query?: { categorymembers?: CataloguePage[] };
}

interface ParseResponse {
  parse?: {
    pageid: number;
    title: string;
    displaytitle?: string;
    text?: { '*': string };
    categories?: Array<{ '*': string }>;
  };
}

const EDITIONS: Record<
  Edition,
  { base: string; category: string; namespace: string; titlePrefixes: string[] }
> = {
  en: {
    base: 'https://en.wikibooks.org',
    category: 'Category:Recipes',
    namespace: '102',
    titlePrefixes: ['Cookbook:'],
  },
};

const cataloguePromises = new Map<Edition, Promise<CataloguePage[]>>();

async function api<T>(edition: Edition, params: Record<string, string>): Promise<T> {
  const query = new URLSearchParams({
    format: 'json',
    origin: '*',
    ...params,
  });
  try {
    const response = await fetch(`${EDITIONS[edition].base}/w/api.php?${query}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(String(response.status));
    return (await response.json()) as T;
  } catch (error) {
    throw new InspirationUnavailableError(error);
  }
}

async function loadCatalogue(edition: Edition): Promise<CataloguePage[]> {
  const existing = cataloguePromises.get(edition);
  if (existing) return existing;

  const pending = (async () => {
    const pages: CataloguePage[] = [];
    let continuation = '';
    do {
      const data = await api<CategoryResponse>(edition, {
        action: 'query',
        list: 'categorymembers',
        cmtitle: EDITIONS[edition].category,
        cmnamespace: EDITIONS[edition].namespace,
        cmtype: 'page',
        cmlimit: 'max',
        ...(continuation ? { cmcontinue: continuation } : {}),
      });
      pages.push(...(data.query?.categorymembers ?? []));
      continuation = data.continue?.cmcontinue ?? '';
    } while (continuation);

    return pages.filter((page) =>
      EDITIONS[edition].titlePrefixes.some((prefix) => page.title.startsWith(prefix)),
    );
  })();

  cataloguePromises.set(edition, pending);
  try {
    return await pending;
  } catch (error) {
    cataloguePromises.delete(edition);
    throw error;
  }
}

function displayTitle(title: string, edition: Edition): string {
  const prefix = EDITIONS[edition].titlePrefixes.find((value) => title.startsWith(value));
  return prefix ? title.slice(prefix.length).trim() : title;
}

function summary(edition: Edition, page: CataloguePage): ExternalSummary {
  return {
    id: `${edition}:${page.pageid}`,
    name: displayTitle(page.title, edition),
    sourceLanguage: edition,
  };
}

function cleanText(text: string): string {
  return text
    .replace(/\[[^\]]*edit[^\]]*\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function headingKey(element: Element): string {
  return normalizeName(element.textContent?.replace(/\[edit\]/gi, '') ?? '');
}

const INGREDIENT_HEADINGS = new Set(
  ['ingredients', 'ingredient', '材料', '食材', '配料', '用料', '原料'].map(normalizeName),
);
const METHOD_HEADINGS = new Set(
  [
    'procedure',
    'method',
    'instructions',
    'directions',
    'preparation',
    '做法',
    '步骤',
    '作法',
    '制作方法',
    '烹调方法',
  ].map(normalizeName),
);

function contentAfterHeading(heading: Element): Element[] {
  const level = Number(heading.tagName.slice(1));
  const elements: Element[] = [];
  const anchor = heading.parentElement?.classList.contains('mw-heading')
    ? heading.parentElement
    : heading;
  let next = anchor.nextElementSibling;
  while (next) {
    const nextHeading = next.matches('h1, h2, h3, h4, h5, h6')
      ? next
      : next.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6');
    if (nextHeading && Number(nextHeading.tagName.slice(1)) <= level) break;
    elements.push(next);
    next = next.nextElementSibling;
  }
  return elements;
}

function ingredientsFrom(elements: Element[]): Array<{ name: string; measure?: string }> {
  const rows = elements.flatMap((element) => [...element.querySelectorAll('tr')]);
  const tableIngredients = rows
    .map((row) =>
      [...row.querySelectorAll('th, td')]
        .map((cell) => cleanText(cell.textContent ?? ''))
        .filter(Boolean),
    )
    .filter((cells) => cells.length > 0 && !/^(ingredient|材料|食材|配料)$/i.test(cells[0]))
    .map(([name, ...quantities]) => ({
      name,
      ...(quantities.length > 0 ? { measure: quantities.join(' · ') } : {}),
    }));
  if (tableIngredients.length > 0) return tableIngredients;

  const listItems = elements.flatMap((element) => [...element.querySelectorAll('li')]);
  const source = listItems.length > 0 ? listItems : elements;
  return source
    .map((element) => cleanText(element.textContent ?? ''))
    .filter(Boolean)
    .map((name) => ({ name }));
}

function paragraphLines(elements: Element[]): string[] {
  const ordered = elements.flatMap((element) => [...element.querySelectorAll('li')]);
  if (ordered.length > 0) {
    return ordered.map((element) => cleanText(element.textContent ?? '')).filter(Boolean);
  }
  return elements
    .flatMap((element) => [...element.querySelectorAll('p')])
    .map((element) => cleanText(element.textContent ?? ''))
    .filter(Boolean);
}

function extractRecipeHtml(html: string, base: string): {
  ingredients: Array<{ name: string }>;
  instructions: string;
  thumbnail?: string;
  bodyText: string;
} {
  const document = new DOMParser().parseFromString(html, 'text/html');
  document
    .querySelectorAll(
      'script, style, table.navbox, .mw-editsection, .noprint, .navigation-box, sup.reference',
    )
    .forEach((element) => element.remove());

  let ingredients: Array<{ name: string; measure?: string }> = [];
  let instructionLines: string[] = [];
  for (const heading of document.querySelectorAll('h2, h3, h4')) {
    const key = headingKey(heading);
    if (ingredients.length === 0 && INGREDIENT_HEADINGS.has(key)) {
      ingredients = ingredientsFrom(contentAfterHeading(heading));
    }
    if (instructionLines.length === 0 && METHOD_HEADINGS.has(key)) {
      instructionLines = paragraphLines(contentAfterHeading(heading));
    }
  }

  const image = document.querySelector('.mw-parser-output img') as HTMLImageElement | null;
  const imageSource = image?.getAttribute('src');
  const thumbnail = imageSource ? new URL(imageSource, base).href : undefined;
  const bodyText = cleanText(document.querySelector('.mw-parser-output')?.textContent ?? '');

  return {
    ingredients,
    instructions: instructionLines.join('\n'),
    thumbnail,
    bodyText,
  };
}

const COUNTRY_CATEGORY: Array<[RegExp, string]> = [
  [/chinese|china|中国|中國/i, 'cn'],
  [/french|france|法国|法國/i, 'fr'],
  [/italian|italy|意大利|義大利/i, 'it'],
  [/japanese|japan|日本/i, 'jp'],
  [/indian|india|印度/i, 'in'],
  [/mexican|mexico|墨西哥/i, 'mx'],
  [/thai|thailand|泰国|泰國/i, 'th'],
  [/vietnamese|vietnam|越南/i, 'vn'],
  [/korean|korea|韩国|韓國/i, 'kr'],
  [/spanish|spain|西班牙/i, 'es'],
  [/greek|greece|希腊|希臘/i, 'gr'],
  [/moroccan|morocco|摩洛哥/i, 'ma'],
  [/american|united states|美国|美國/i, 'us'],
  [/british|united kingdom|英国|英國/i, 'gb'],
];

function inferCountry(categories: string[]): string | null {
  const text = categories.join(' ');
  return COUNTRY_CATEGORY.find(([pattern]) => pattern.test(text))?.[1] ?? null;
}

function inferCategory(categories: string[]): string {
  const text = normalizeName(categories.join(' '));
  if (/dessert|sweet|cake|cookie|甜点|甜品|糕/.test(text)) return 'dessert';
  if (/soup|broth|汤|湯/.test(text)) return 'soup';
  if (/salad|沙拉|凉拌|涼拌/.test(text)) return 'salad';
  if (/appetizer|starter|snack|小吃|点心|點心/.test(text)) return 'appetizer';
  return 'main';
}

function decodeId(id: string): { edition: Edition; pageid: string } | null {
  const match = /^(en):(\d+)$/.exec(id);
  return match ? { edition: match[1] as Edition, pageid: match[2] } : null;
}

export const wikibooks: InspirationProvider = {
  id: 'wikibooks',
  name: 'Wikibooks Cookbook',
  homepage: 'https://en.wikibooks.org/wiki/Cookbook:Recipes',

  async listAreas() {
    return [];
  },

  async listCategories() {
    return [];
  },

  async findCandidates(filters: InspirationFilters) {
    const edition: Edition = 'en';
    const catalogue = await loadCatalogue(edition);
    const query =
      filters.translatedQueries?.en?.trim() || filters.ingredient?.trim() || '';
    const matches = query
      ? catalogue.filter((page) => looseIncludes(displayTitle(page.title, edition), query))
      : catalogue;
    return shuffle(matches.map((page) => summary(edition, page))).slice(0, 120);
  },

  async getById(id: string) {
    const decoded = decodeId(id);
    if (!decoded) return null;
    const { edition, pageid } = decoded;
    const data = await api<ParseResponse>(edition, {
      action: 'parse',
      pageid,
      prop: 'text|categories|displaytitle',
    });
    const parsed = data.parse;
    if (!parsed?.text?.['*']) return null;

    const extracted = extractRecipeHtml(parsed.text['*'], EDITIONS[edition].base);
    const categories = (parsed.categories ?? []).map((item) => item['*']);
    const title = displayTitle(parsed.title, edition);
    const sourceUrl = `${EDITIONS[edition].base}/wiki/${encodeURIComponent(parsed.title.replace(/ /g, '_'))}`;

    return {
      id,
      name: title,
      sourceLanguage: edition,
      category: inferCategory(categories),
      area: 'Wikibooks',
      countryCode: inferCountry(categories),
      thumbnail: extracted.thumbnail,
      instructions: extracted.instructions || extracted.bodyText,
      ingredients: extracted.ingredients,
      sourceUrl,
      tags: categories,
      durationMinutes: null,
    } satisfies ExternalRecipe;
  },

  async getRandom(count: number) {
    const candidates = await this.findCandidates({});
    const picked = shuffle(candidates).slice(0, Math.max(count * 2, count));
    const recipes: ExternalRecipe[] = [];
    for (const candidate of picked) {
      if (recipes.length >= count) break;
      const detail = await this.getById(candidate.id);
      if (detail) recipes.push(detail);
    }
    return recipes;
  },
};

export function mapWikibooksCategory(label: string | undefined): string {
  return label || 'main';
}
