import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import { useRecipes } from '../db/recipeStore';
import { isUsingFallback } from '../db/idb';

/** Where the data lives, in plain words. No account means no ambiguity. */
export function Privacy() {
  const { t } = useI18n();
  const { recipes } = useRecipes();

  return (
    <main className="page">
      <header className="page-header">
        <h1 className="page-title">{t('privacy.title')}</h1>
      </header>

      <div className="stack">
        <p>{t('privacy.body1')}</p>
        <p style={{ color: 'var(--text-muted)' }}>{t('privacy.body2')}</p>
        <p style={{ color: 'var(--text-muted)' }}>{t('privacy.body3')}</p>

        <div className="notice">
          <span className="notice__icon" aria-hidden="true">
            🔒
          </span>
          <span>{t('privacy.body4')}</span>
        </div>

        {isUsingFallback() ? (
          <div className="notice notice--warn">
            <span className="notice__icon" aria-hidden="true">
              ⚠
            </span>
            <span>{t('error.storage')}</span>
          </div>
        ) : null}

        <div className="row">
          <Link className="btn btn--primary" to="/recipes">
            {recipes.length > 0 ? t('recipes.exportAll') : t('recipes.title')}
          </Link>
          <Link className="btn btn--ghost" to="/">
            {t('error.backHome')}
          </Link>
        </div>
      </div>
    </main>
  );
}
