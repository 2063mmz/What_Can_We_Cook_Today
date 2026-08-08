import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RecipeCard } from '../components/RecipeCard';
import { useToast } from '../components/Toast';
import { useI18n } from '../i18n/context';
import { deleteRecipe, useRecipes } from '../db/recipeStore';
import { recipesToJson } from '../lib/backup';
import { datedFilename, downloadText } from '../lib/download';
import { recipesToMarkdownBundle, recipeToMarkdown } from '../lib/markdown';
import { looseIncludes } from '../lib/normalize';
import { recipeDisplayName, toFileSlug } from '../lib/recipe';
import {
  RECIPE_CATEGORIES,
  RECIPE_OCCASIONS,
  type Recipe,
  type RecipeCategory,
  type RecipeOccasion,
} from '../types/recipe';

export function MyRecipes() {
  const { t, lang } = useI18n();
  const { recipes, status } = useRecipes();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<RecipeCategory | ''>('');
  const [occasion, setOccasion] = useState<RecipeOccasion | ''>('');
  const [pendingDelete, setPendingDelete] = useState<Recipe | null>(null);

  const filtered = useMemo(
    () =>
      recipes.filter((recipe) => {
        if (category && recipe.category !== category) return false;
        if (occasion && recipe.occasion !== occasion) return false;
        if (!query.trim()) return true;
        return (
          looseIncludes(recipe.name, query) ||
          Object.values(recipe.localizedNames ?? {}).some((name) =>
            looseIncludes(name, query),
          ) ||
          recipe.ingredients.some((item) => looseIncludes(item.name, query))
        );
      }),
    [recipes, query, category, occasion],
  );

  const hasFilters = Boolean(query || category || occasion);

  const exportOne = (recipe: Recipe) => {
    const filename = `${toFileSlug(recipe.name)}.md`;
    downloadText(filename, recipeToMarkdown(recipe));
    toast.show(t('export.downloaded', { file: filename }));
  };

  const exportAll = () => {
    if (recipes.length === 0) {
      toast.show(t('export.nothing'));
      return;
    }
    const filename = datedFilename('my-recipes', 'md');
    downloadText(filename, recipesToMarkdownBundle(recipes));
    toast.show(t('export.downloaded', { file: filename }));
  };

  const exportJson = () => {
    if (recipes.length === 0) {
      toast.show(t('export.nothing'));
      return;
    }
    const filename = datedFilename('my-recipes', 'json');
    downloadText(filename, recipesToJson(recipes), 'application/json;charset=utf-8');
    toast.show(t('export.downloaded', { file: filename }));
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const name = recipeDisplayName(pendingDelete, lang);
    await deleteRecipe(pendingDelete.id);
    setPendingDelete(null);
    toast.show(t('recipes.deleted', { name }));
  };

  if (status === 'ready' && recipes.length === 0) {
    return (
      <main className="page">
        <div className="empty">
          <span className="empty__art" aria-hidden="true">
            📖
          </span>
          <h1 className="empty__title">{t('tonight.noRecipes.title')}</h1>
          <p className="empty__body">{t('tonight.noRecipes.body')}</p>
          <div className="empty__actions">
            <Link className="btn btn--primary" to="/recipes/new">
              {t('tonight.noRecipes.create')}
            </Link>
            <Link className="btn" to="/import">
              {t('recipes.import')}
            </Link>
            <Link className="btn btn--ghost" to="/inspiration">
              {t('tonight.noRecipes.inspiration')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page page--wide">
      <header className="page-header">
        <h1 className="page-title">{t('recipes.title')}</h1>
        <p className="page-subtitle">
          {recipes.length === 1
            ? t('recipes.countOne')
            : t('recipes.count', { count: recipes.length })}
        </p>
      </header>

      <div className="stack">
        <div className="toolbar">
          <div className="toolbar__grow">
            <input
              className="input"
              type="search"
              value={query}
              placeholder={t('recipes.searchPlaceholder')}
              aria-label={t('recipes.search')}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="toolbar__filters">
            <select
              className="select"
              value={category}
              aria-label={t('recipes.filterCategory')}
              onChange={(event) => setCategory(event.target.value as RecipeCategory | '')}
            >
              <option value="">{t('recipes.filterCategory')} · {t('common.all')}</option>
              {RECIPE_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {t(`category.${value}`)}
                </option>
              ))}
            </select>
            <select
              className="select"
              value={occasion}
              aria-label={t('recipes.filterOccasion')}
              onChange={(event) => setOccasion(event.target.value as RecipeOccasion | '')}
            >
              <option value="">{t('recipes.filterOccasion')} · {t('common.all')}</option>
              {RECIPE_OCCASIONS.map((value) => (
                <option key={value} value={value}>
                  {t(`occasion.${value}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="toolbar">
          <Link className="btn btn--soft btn--small" to="/recipes/new">
            + {t('recipes.new')}
          </Link>
          <Link className="btn btn--small" to="/import">
            {t('recipes.import')}
          </Link>
          <button type="button" className="btn btn--small" onClick={exportAll}>
            {t('recipes.exportAll')}
          </button>
          <button type="button" className="btn btn--small btn--ghost" onClick={exportJson}>
            {t('recipes.exportAllJson')}
          </button>
        </div>

        {pendingDelete ? (
          <div className="notice notice--warn" role="alertdialog" aria-label={t('common.delete')}>
            <span className="notice__icon" aria-hidden="true">
              ⚠
            </span>
            <div className="row" style={{ flex: 1, justifyContent: 'space-between' }}>
              <span>{t('recipes.deleteConfirm', { name: pendingDelete.name })}</span>
              <span className="row">
                <button type="button" className="btn btn--small btn--danger" onClick={confirmDelete}>
                  {t('common.delete')}
                </button>
                <button
                  type="button"
                  className="btn btn--small btn--ghost"
                  onClick={() => setPendingDelete(null)}
                >
                  {t('common.cancel')}
                </button>
              </span>
            </div>
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <div className="empty">
            <span className="empty__art" aria-hidden="true">
              🔍
            </span>
            <p className="empty__body">{t('recipes.emptyFiltered')}</p>
            {hasFilters ? (
              <button
                type="button"
                className="btn btn--soft"
                onClick={() => {
                  setQuery('');
                  setCategory('');
                  setOccasion('');
                }}
              >
                {t('recipes.clearFilters')}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="recipe-grid">
            {filtered.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onExport={exportOne}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        )}
      </div>

      {toast.element}
    </main>
  );
}
