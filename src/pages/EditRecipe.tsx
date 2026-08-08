import { Link, useNavigate, useParams } from 'react-router-dom';
import { RecipeForm } from '../components/RecipeForm';
import { useI18n } from '../i18n/context';
import { saveRecipe, useRecipe, useRecipes } from '../db/recipeStore';
import { recipeToDraft } from '../lib/recipe';

export function EditRecipe() {
  const { id } = useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { status } = useRecipes();
  const recipe = useRecipe(id);

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

  return (
    <main className="page">
      <header className="page-header">
        <h1 className="page-title">{t('form.editTitle')}</h1>
      </header>

      <RecipeForm
        initialDraft={recipeToDraft(recipe)}
        submitLabel="form.submitUpdate"
        onSubmit={async (updated) => {
          await saveRecipe(updated);
          navigate(`/recipes/${updated.id}`, { replace: true });
        }}
        onCancel={() => navigate(`/recipes/${recipe.id}`)}
      />
    </main>
  );
}
