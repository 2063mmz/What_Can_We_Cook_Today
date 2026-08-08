import { Link, useParams } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { CATEGORY_EMOJI } from '../data/foodEmoji';
import { useI18n } from '../i18n/context';
import { useRecipe, useRecipes } from '../db/recipeStore';
import { downloadText } from '../lib/download';
import { cuisineLabel, formatDate, OCCASION_ICONS } from '../lib/labels';
import { recipeToMarkdown } from '../lib/markdown';
import { formatDuration, recipeDisplayName, toFileSlug } from '../lib/recipe';

export function RecipeDetail() {
  const { id } = useParams();
  const { t, lang, locale } = useI18n();
  const { status } = useRecipes();
  const recipe = useRecipe(id);
  const toast = useToast();

  if (status === 'loading') {
    return (
      <main className="page">
        <p className="page-subtitle">{t('common.loading')}</p>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="page">
        <div className="empty">
          <span className="empty__art" aria-hidden="true">
            🕳️
          </span>
          <p className="empty__body">{t('detail.notFound')}</p>
          <Link className="btn btn--soft" to="/recipes">
            {t('recipes.title')}
          </Link>
        </div>
      </main>
    );
  }

  const cuisine = cuisineLabel(recipe, lang, t);
  const emoji = recipe.emoji || CATEGORY_EMOJI[recipe.category];
  const steps = recipe.instructions.split('\n').map((line) => line.trim()).filter(Boolean);
  const displayName = recipeDisplayName(recipe, lang);

  const exportOne = () => {
    const filename = `${toFileSlug(recipe.name)}.md`;
    downloadText(filename, recipeToMarkdown(recipe));
    toast.show(t('export.downloaded', { file: filename }));
  };

  return (
    <main className="page">
      <header className="page-header">
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <span style={{ fontSize: '2rem', lineHeight: 1 }} aria-hidden="true">
            {emoji}
          </span>
          <h1 className="page-title" style={{ flex: 1 }}>
            {displayName}
          </h1>
        </div>
        <p className="recipe-card__meta" style={{ marginTop: 'var(--space-3)' }}>
          <span>
            <span className="meta-icon" aria-hidden="true">{cuisine.icon}</span>
            {cuisine.text}
          </span>
          <span className="dot">{t(`category.${recipe.category}`)}</span>
          <span className="dot">{formatDuration(recipe.durationMinutes, t)}</span>
          <span className="dot">
            <span className="meta-icon" aria-hidden="true">{OCCASION_ICONS[recipe.occasion]}</span>
            {t(`occasion.${recipe.occasion}`)}
          </span>
        </p>
      </header>

      <div className="stack">
        <div className="toolbar">
          <Link className="btn btn--small btn--soft" to={`/recipes/${recipe.id}/edit`}>
            {t('common.edit')}
          </Link>
          <button type="button" className="btn btn--small" onClick={exportOne}>
            {t('recipes.exportOne')}
          </button>
          <Link className="btn btn--small btn--ghost" to="/recipes">
            {t('common.back')}
          </Link>
        </div>

        <hr className="pixel-rule" />

        <section className="question">
          <h2 className="question__title">{t('detail.ingredients')}</h2>
          <ul className="detail-list">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.id}>
                <span className="detail-list__marker" aria-hidden="true">
                  ▪
                </span>
                <span>{ingredient.name}</span>
                {ingredient.quantity ? (
                  <span className="detail-list__qty">{ingredient.quantity}</span>
                ) : null}
                {ingredient.optional ? (
                  <span className="badge badge--quiet">{t('common.optional')}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        {recipe.seasonings.length > 0 ? (
          <section className="question">
            <h2 className="question__title">{t('detail.seasonings')}</h2>
            <ul className="detail-list">
              {recipe.seasonings.map((seasoning) => (
                <li key={seasoning.id}>
                  <span className="detail-list__marker" aria-hidden="true">
                    ▪
                  </span>
                  <span>{seasoning.name}</span>
                  {seasoning.quantity ? (
                    <span className="detail-list__qty">{seasoning.quantity}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="question">
          <h2 className="question__title">{t('detail.instructions')}</h2>
          {steps.length > 0 ? (
            <ol className="steps-list">
              {steps.map((step, index) => (
                <li key={index}>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="field__hint">{t('detail.empty')}</p>
          )}
        </section>

        {recipe.notes ? (
          <section className="question">
            <h2 className="question__title">{t('detail.notes')}</h2>
            <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>
              {recipe.notes}
            </p>
          </section>
        ) : null}

        <p className="field__hint">
          {t('detail.added', { date: formatDate(recipe.createdAt, locale) })}
          {recipe.source?.url ? (
            <>
              {' · '}
              <a href={recipe.source.url} target="_blank" rel="noreferrer noopener">
                {t('inspiration.sourceLink')}
              </a>
            </>
          ) : null}
        </p>
      </div>

      {toast.element}
    </main>
  );
}
