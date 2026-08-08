import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import { CATEGORY_EMOJI } from '../data/foodEmoji';
import { cuisineLabel, OCCASION_ICONS } from '../lib/labels';
import { formatDuration, recipeDisplayName } from '../lib/recipe';
import type { Recipe } from '../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete?: (recipe: Recipe) => void;
  onExport?: (recipe: Recipe) => void;
}

/**
 * A deliberately light card: thin border, no shadow, plenty of air. Detail
 * lives on the recipe page, not here.
 */
export function RecipeCard({ recipe, onDelete, onExport }: RecipeCardProps) {
  const { t, lang } = useI18n();
  const cuisine = cuisineLabel(recipe, lang, t);
  const emoji = recipe.emoji || CATEGORY_EMOJI[recipe.category];
  const displayName = recipeDisplayName(recipe, lang);

  return (
    <article className="recipe-card">
      <div className="recipe-card__head">
        <span className="recipe-card__emoji" aria-hidden="true">
          {emoji}
        </span>
        <div>
          <h3 className="recipe-card__name">
            <Link to={`/recipes/${recipe.id}`}>{displayName}</Link>
          </h3>
          <p className="recipe-card__meta">
            <span>
              <span className="meta-icon" aria-hidden="true">{cuisine.icon}</span>
              {cuisine.text}
            </span>
          </p>
        </div>
      </div>

      <p className="recipe-card__meta">
        <span>{t(`category.${recipe.category}`)}</span>
        <span className="dot">{formatDuration(recipe.durationMinutes, t)}</span>
        <span className="dot">
          <span className="meta-icon" aria-hidden="true">{OCCASION_ICONS[recipe.occasion]}</span>
          {t(`occasion.short.${recipe.occasion}`)}
        </span>
      </p>

      <div className="recipe-card__actions">
        <Link className="btn btn--small" to={`/recipes/${recipe.id}`}>
          {t('common.view')}
        </Link>
        <Link className="btn btn--small" to={`/recipes/${recipe.id}/edit`}>
          {t('common.edit')}
        </Link>
        {onExport ? (
          <button
            type="button"
            className="btn btn--small btn--ghost"
            onClick={() => onExport(recipe)}
          >
            {t('recipes.exportOne')}
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            className="btn btn--small btn--danger"
            onClick={() => onDelete(recipe)}
          >
            {t('common.delete')}
          </button>
        ) : null}
      </div>
    </article>
  );
}
