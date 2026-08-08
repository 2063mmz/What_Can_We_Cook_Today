import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { RecipeForm } from '../components/RecipeForm';
import { useI18n } from '../i18n/context';
import { saveRecipe } from '../db/recipeStore';
import { emptyDraft } from '../lib/recipe';
import type { RecipeDraft } from '../types/recipe';
import type { ParsedField } from '../lib/markdown';

/**
 * Add a recipe.
 *
 * Also the confirmation step for anything coming from outside — a Markdown
 * import or an external inspiration recipe navigates here with a pre-filled
 * draft, so nothing ever enters the collection without being seen first.
 */
interface AddRecipeState {
  draft?: RecipeDraft;
  unresolved?: ParsedField[];
  fromExternal?: boolean;
}

export function AddRecipe() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as AddRecipeState;
  const isReview = Boolean(state.draft);

  return (
    <main className="page">
      <header className="page-header">
        <h1 className="page-title">{t('form.createTitle')}</h1>
        {isReview ? (
          <p className="page-subtitle">{t('import.foundOne')}</p>
        ) : null}
      </header>

      <RecipeForm
        initialDraft={state.draft ?? emptyDraft()}
        unresolved={state.unresolved}
        submitLabel={isReview ? 'form.submitConfirm' : 'form.submitCreate'}
        notice={
          state.fromExternal ? (
            <div className="notice">
              <span className="notice__icon" aria-hidden="true">
                ✨
              </span>
              <span>
                {t('inspiration.addNote')} {t('inspiration.noDurationForm')}
              </span>
            </div>
          ) : null
        }
        onSubmit={async (recipe) => {
          await saveRecipe(recipe);
          navigate(`/recipes/${recipe.id}`, {
            replace: true,
            state: { justSaved: recipe.name },
          });
        }}
        onCancel={() => navigate(-1)}
      />

      <p className="field__hint" style={{ marginTop: 'var(--space-5)' }}>
        {t('privacy.body1')} <Link to="/privacy">{t('privacy.link')}</Link>
      </p>
    </main>
  );
}
