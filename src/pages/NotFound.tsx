import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/context';

export function NotFound() {
  const { t } = useI18n();
  return (
    <main className="page">
      <div className="empty">
        <span className="empty__art" aria-hidden="true">
          🍽️
        </span>
        <h1 className="empty__title">{t('error.notFound')}</h1>
        <Link className="btn btn--primary" to="/">
          {t('error.backHome')}
        </Link>
      </div>
    </main>
  );
}
