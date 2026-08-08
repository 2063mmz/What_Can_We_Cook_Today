/**
 * The contract every inspiration source must satisfy.
 *
 * The app's core — your own recipes, Tonight, import/export — never touches
 * this. Inspiration is an optional extra, so a source being slow, offline or
 * replaced can never break the rest of the product.
 */

export interface ExternalIngredient {
  name: string;
  /** The source's own wording, e.g. "1 tbsp". Never parsed or converted. */
  measure?: string;
}

export interface ExternalRecipe {
  id: string;
  name: string;
  /** Language of the source page and its recipe body. */
  sourceLanguage: 'en' | 'zh' | 'fr';
  /** The source's own category label, shown as-is. */
  category?: string;
  /** The source's own region label, shown as-is. */
  area?: string;
  /** Mapped onto our country whitelist, or null when there is no safe match. */
  countryCode: string | null;
  thumbnail?: string;
  instructions: string;
  ingredients: ExternalIngredient[];
  sourceUrl?: string;
  videoUrl?: string;
  tags: string[];
  /**
   * Cooking time as reported by the source.
   *
   * Wikibooks may not publish one, so this can be null. The UI
   * says so plainly rather than guessing a number.
   */
  durationMinutes: number | null;
}

/** A lightweight entry used to build the rolling list before details load. */
export interface ExternalSummary {
  id: string;
  name: string;
  sourceLanguage: 'en' | 'zh' | 'fr';
  thumbnail?: string;
}

export interface InspirationFilters {
  /** A single main ingredient, in the source's own vocabulary. */
  ingredient?: string;
  /** Source area label, e.g. "Italian". */
  area?: string;
  /** Source category label, e.g. "Seafood". */
  category?: string;
  /** Search terms translated for each source catalogue. */
  translatedQueries?: Partial<Record<'en' | 'zh' | 'fr', string>>;
}

export interface InspirationProvider {
  readonly id: string;
  /** Shown in the attribution line. */
  readonly name: string;
  readonly homepage: string;
  listAreas(): Promise<string[]>;
  listCategories(): Promise<string[]>;
  /** Everything matching the filters. An empty array means "no results". */
  findCandidates(filters: InspirationFilters): Promise<ExternalSummary[]>;
  getById(id: string): Promise<ExternalRecipe | null>;
  /** Unfiltered draws, used when the user sets no constraints. */
  getRandom(count: number): Promise<ExternalRecipe[]>;
}

/** Thrown when the source cannot be reached, so the UI can say exactly that. */
export class InspirationUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('inspiration source unavailable');
    this.name = 'InspirationUnavailableError';
    this.cause = cause;
  }
}
