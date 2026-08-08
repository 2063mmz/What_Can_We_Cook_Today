/**
 * Small user preferences that are not recipes: the extra ingredients someone
 * typed on the Tonight page, and which dishes were suggested recently so the
 * random pick doesn't repeat itself three nights in a row.
 *
 * localStorage is the right tool here — these are tiny, synchronous reads.
 */

const EXTRA_INGREDIENTS_KEY = 'wiet.extraIngredients';
const RECENT_PICKS_KEY = 'wiet.recentPicks';
const RECENT_LIMIT = 5;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Preferences are a nicety; never break the app over them. */
  }
}

/** Ingredients the user added by hand that aren't in any recipe yet. */
export function readExtraIngredients(): string[] {
  const value = readJson<string[]>(EXTRA_INGREDIENTS_KEY, []);
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
}

export function writeExtraIngredients(names: string[]): void {
  writeJson(EXTRA_INGREDIENTS_KEY, names);
}

/** Recipe ids picked recently, newest first. */
export function readRecentPicks(): string[] {
  const value = readJson<string[]>(RECENT_PICKS_KEY, []);
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
}

export function rememberPick(id: string): void {
  const next = [id, ...readRecentPicks().filter((item) => item !== id)].slice(
    0,
    RECENT_LIMIT,
  );
  writeJson(RECENT_PICKS_KEY, next);
}
