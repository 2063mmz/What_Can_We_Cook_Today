import { useId, useMemo, useState, type ReactNode } from 'react';
import { useI18n } from '../i18n/context';
import { sortedCountries } from '../data/countries';
import { OCCASION_ICONS } from '../lib/labels';
import type { ParsedField } from '../lib/markdown';
import {
  draftToRecipe,
  emptyIngredient,
  emptySeasoning,
  validateDraft,
  type DraftErrors,
} from '../lib/recipe';
import {
  RECIPE_CATEGORIES,
  RECIPE_OCCASIONS,
  type Recipe,
  type RecipeDraft,
} from '../types/recipe';
import type { TranslationKey } from '../i18n';

const DURATION_PRESETS = [15, 30, 45, 60];

/** Which form control each import warning points at. */
const FIELD_LABELS: Record<ParsedField, TranslationKey> = {
  name: 'form.name',
  category: 'form.category',
  occasion: 'form.occasion',
  duration: 'form.duration',
  cuisine: 'cuisine.label',
  ingredients: 'form.ingredients',
};

interface RecipeFormProps {
  initialDraft: RecipeDraft;
  submitLabel: TranslationKey;
  onSubmit: (recipe: Recipe) => void | Promise<void>;
  onCancel?: () => void;
  /** Fields an import could not read; shown as a "please check" notice. */
  unresolved?: readonly ParsedField[];
  /** Extra context above the form, e.g. where this draft came from. */
  notice?: ReactNode;
  /** An extra action next to submit, e.g. "Skip this one". */
  secondaryAction?: ReactNode;
}

export function RecipeForm({
  initialDraft,
  submitLabel,
  onSubmit,
  onCancel,
  unresolved,
  notice,
  secondaryAction,
}: RecipeFormProps) {
  const { t, lang } = useI18n();
  const [draft, setDraft] = useState<RecipeDraft>(initialDraft);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [saving, setSaving] = useState(false);
  const ids = useIds();

  const countries = useMemo(() => sortedCountries(lang), [lang]);
  const isCustomDuration =
    draft.durationMinutes !== '' &&
    !DURATION_PRESETS.includes(Number(draft.durationMinutes));
  const [customDuration, setCustomDuration] = useState(isCustomDuration);

  const update = <K extends keyof RecipeDraft>(key: K, value: RecipeDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validateDraft(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(firstErrorId(found, ids))?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSubmit(draftToRecipe(draft));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="stack" onSubmit={handleSubmit} noValidate>
      {notice}

      {unresolved && unresolved.length > 0 ? (
        <div className="notice notice--warn">
          <span className="notice__icon" aria-hidden="true">
            ✎
          </span>
          <span>
            {t('import.partial')}{' '}
            <strong>
              {unresolved.map((field) => t(FIELD_LABELS[field])).join(' · ')}
            </strong>
          </span>
        </div>
      ) : null}

      {/* --- Name and icon --- */}
      <div className="field">
        <label className="field__label" htmlFor={ids.name}>
          {t('form.name')}
        </label>
        <div className="row" style={{ flexWrap: 'nowrap' }}>
          <input
            id={ids.name}
            className="input"
            value={draft.name}
            placeholder={t('form.namePlaceholder')}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? ids.nameError : undefined}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                name: event.target.value,
                // A manually edited source title invalidates cached translations.
                localizedNames: undefined,
              }))
            }
          />
          <input
            className="input input--compact"
            style={{ maxWidth: 68, textAlign: 'center' }}
            value={draft.emoji ?? ''}
            maxLength={4}
            aria-label={t('form.emoji')}
            placeholder="🍳"
            onChange={(event) => update('emoji', event.target.value || undefined)}
          />
        </div>
        {errors.name ? (
          <p className="field__error" id={ids.nameError}>
            {t(errors.name)}
          </p>
        ) : null}
      </div>

      {/* --- Category --- */}
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="field__label">{t('form.category')}</legend>
        <div className="chip-group">
          {RECIPE_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className="chip"
              aria-pressed={draft.category === category}
              onClick={() => update('category', category)}
            >
              {t(`category.${category}`)}
            </button>
          ))}
        </div>
      </fieldset>

      {/* --- Occasion --- */}
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="field__label">{t('form.occasion')}</legend>
        <div className="option-grid">
          {RECIPE_OCCASIONS.map((occasion) => (
            <button
              key={occasion}
              type="button"
              className="option"
              aria-pressed={draft.occasion === occasion}
              onClick={() => update('occasion', occasion)}
            >
              <span className="option__icon" aria-hidden="true">
                {OCCASION_ICONS[occasion]}
              </span>
              <span>{t(`occasion.${occasion}`)}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* --- Ingredients --- */}
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="field__label">{t('form.ingredients')}</legend>
        <p className="field__hint">{t('form.ingredientsHint')}</p>
        <div className="stack-sm">
          {draft.ingredients.map((ingredient, index) => (
            <div className="repeat-row" key={ingredient.id}>
              <input
                className="input repeat-row__name"
                value={ingredient.name}
                placeholder={t('form.ingredientPlaceholder')}
                aria-label={`${t('form.ingredientPlaceholder')} ${index + 1}`}
                onChange={(event) =>
                  update(
                    'ingredients',
                    draft.ingredients.map((item) =>
                      item.id === ingredient.id
                        ? { ...item, name: event.target.value }
                        : item,
                    ),
                  )
                }
              />
              <input
                className="input repeat-row__qty"
                value={ingredient.quantity ?? ''}
                placeholder={t('form.quantityPlaceholder')}
                aria-label={`${t('form.quantityPlaceholder')} ${index + 1}`}
                onChange={(event) =>
                  update(
                    'ingredients',
                    draft.ingredients.map((item) =>
                      item.id === ingredient.id
                        ? { ...item, quantity: event.target.value }
                        : item,
                    ),
                  )
                }
              />
              <button
                type="button"
                className="toggle-optional"
                aria-pressed={ingredient.optional}
                aria-label={t('form.markOptional', {
                  name: ingredient.name || String(index + 1),
                })}
                onClick={() =>
                  update(
                    'ingredients',
                    draft.ingredients.map((item) =>
                      item.id === ingredient.id
                        ? { ...item, optional: !item.optional }
                        : item,
                    ),
                  )
                }
              >
                {ingredient.optional
                  ? t('form.optionalToggle')
                  : t('form.requiredToggle')}
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label={t('form.removeIngredient', {
                  name: ingredient.name || String(index + 1),
                })}
                disabled={draft.ingredients.length === 1}
                onClick={() =>
                  update(
                    'ingredients',
                    draft.ingredients.filter((item) => item.id !== ingredient.id),
                  )
                }
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div>
          <button
            type="button"
            className="btn btn--soft btn--small"
            onClick={() =>
              update('ingredients', [...draft.ingredients, emptyIngredient()])
            }
          >
            + {t('form.addIngredient')}
          </button>
        </div>
        {errors.ingredients ? (
          <p className="field__error">{t(errors.ingredients)}</p>
        ) : null}
      </fieldset>

      {/* --- Seasonings --- */}
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="field__label">{t('form.seasonings')}</legend>
        <p className="field__hint">{t('form.seasoningsHint')}</p>
        <div className="stack-sm">
          {draft.seasonings.map((seasoning, index) => (
            <div className="repeat-row" key={seasoning.id}>
              <input
                className="input repeat-row__name"
                value={seasoning.name}
                placeholder={t('form.seasoningPlaceholder')}
                aria-label={`${t('form.seasoningPlaceholder')} ${index + 1}`}
                onChange={(event) =>
                  update(
                    'seasonings',
                    draft.seasonings.map((item) =>
                      item.id === seasoning.id
                        ? { ...item, name: event.target.value }
                        : item,
                    ),
                  )
                }
              />
              <input
                className="input repeat-row__qty"
                value={seasoning.quantity ?? ''}
                placeholder={t('form.quantityPlaceholder')}
                aria-label={`${t('form.quantityPlaceholder')} ${index + 1}`}
                onChange={(event) =>
                  update(
                    'seasonings',
                    draft.seasonings.map((item) =>
                      item.id === seasoning.id
                        ? { ...item, quantity: event.target.value }
                        : item,
                    ),
                  )
                }
              />
              <button
                type="button"
                className="icon-btn"
                aria-label={t('form.removeSeasoning', {
                  name: seasoning.name || String(index + 1),
                })}
                onClick={() =>
                  update(
                    'seasonings',
                    draft.seasonings.filter((item) => item.id !== seasoning.id),
                  )
                }
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div>
          <button
            type="button"
            className="btn btn--soft btn--small"
            onClick={() =>
              update('seasonings', [...draft.seasonings, emptySeasoning()])
            }
          >
            + {t('form.addSeasoning')}
          </button>
        </div>
      </fieldset>

      {/* --- Duration --- */}
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="field__label">{t('form.duration')}</legend>
        <div className="chip-group">
          {DURATION_PRESETS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              className="chip"
              aria-pressed={!customDuration && Number(draft.durationMinutes) === minutes}
              onClick={() => {
                setCustomDuration(false);
                update('durationMinutes', String(minutes));
              }}
            >
              {t('common.minutes', { count: minutes })}
            </button>
          ))}
          <button
            type="button"
            className="chip"
            aria-pressed={customDuration}
            onClick={() => setCustomDuration(true)}
          >
            {t('form.durationCustom')}
          </button>
          {customDuration ? (
            <input
              className="input input--compact"
              type="number"
              inputMode="numeric"
              min={1}
              max={1440}
              value={draft.durationMinutes}
              aria-label={t('form.durationCustomLabel')}
              aria-invalid={errors.duration ? true : undefined}
              id={ids.duration}
              onChange={(event) => update('durationMinutes', event.target.value)}
            />
          ) : null}
        </div>
        {errors.duration ? (
          <p className="field__error">{t(errors.duration)}</p>
        ) : null}
      </fieldset>

      {/* --- Cuisine --- */}
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="field__label">{t('cuisine.label')}</legend>
        <div className="chip-group">
          <button
            type="button"
            className="chip"
            aria-pressed={draft.cuisineType === 'home'}
            onClick={() => {
              update('cuisineType', 'home');
              update('cuisineCountry', null);
            }}
          >
            <span className="chip__icon" aria-hidden="true">
              🏠
            </span>
            {t('cuisine.home')}
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={draft.cuisineType === 'country'}
            onClick={() => update('cuisineType', 'country')}
          >
            <span className="chip__icon" aria-hidden="true">
              🌏
            </span>
            {t('cuisine.country')}
          </button>
        </div>
        {draft.cuisineType === 'country' ? (
          <>
            <select
              className="select"
              id={ids.country}
              value={draft.cuisineCountry ?? ''}
              aria-label={t('cuisine.pickCountry')}
              aria-invalid={errors.country ? true : undefined}
              onChange={(event) =>
                update('cuisineCountry', event.target.value || null)
              }
            >
              <option value="">{t('cuisine.pickCountry')}</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.names[lang]}
                </option>
              ))}
            </select>
            {errors.country ? (
              <p className="field__error">{t(errors.country)}</p>
            ) : null}
          </>
        ) : null}
      </fieldset>

      {/* --- Instructions and notes --- */}
      <div className="field">
        <label className="field__label" htmlFor={ids.instructions}>
          {t('form.instructions')}
        </label>
        <textarea
          id={ids.instructions}
          className="textarea"
          value={draft.instructions}
          placeholder={t('form.instructionsPlaceholder')}
          onChange={(event) => update('instructions', event.target.value)}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor={ids.notes}>
          {t('form.notes')}
        </label>
        <textarea
          id={ids.notes}
          className="textarea"
          style={{ minHeight: 80 }}
          value={draft.notes}
          placeholder={t('form.notesPlaceholder')}
          onChange={(event) => update('notes', event.target.value)}
        />
      </div>

      <hr className="pixel-rule" />

      <div className="row">
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {t(submitLabel)}
        </button>
        {secondaryAction}
        {onCancel ? (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            {t('common.cancel')}
          </button>
        ) : null}
        {Object.keys(errors).length > 0 ? (
          <span className="field__error">{t('form.errorSummary')}</span>
        ) : null}
      </div>
    </form>
  );
}

function useIds() {
  const prefix = useId();
  return {
    name: `${prefix}-name`,
    nameError: `${prefix}-name-error`,
    duration: `${prefix}-duration`,
    country: `${prefix}-country`,
    instructions: `${prefix}-instructions`,
    notes: `${prefix}-notes`,
  };
}

function firstErrorId(errors: DraftErrors, ids: ReturnType<typeof useIds>): string {
  if (errors.name) return ids.name;
  if (errors.duration) return ids.duration;
  if (errors.country) return ids.country;
  return ids.name;
}
