import { NavLink, Outlet, Link } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import { BrandTitle, PixelateFilter } from './BrandTitle';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { TranslationKey } from '../i18n';

const NAV_ITEMS: Array<{ to: string; key: TranslationKey; icon: string }> = [
  { to: '/', key: 'nav.tonight', icon: '☀️' },
  { to: '/recipes', key: 'nav.recipes', icon: '📖' },
  { to: '/recipes/new', key: 'nav.add', icon: '✏️' },
  { to: '/inspiration', key: 'nav.inspiration', icon: '✨' },
];

export function Layout() {
  const { t } = useI18n();

  return (
    <div className="app">
      <PixelateFilter />

      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="brand">
            <BrandTitle />
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <nav className="site-nav" aria-label={t('nav.label')}>
        <div className="site-nav__inner">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' || item.to === '/recipes'}
              className="site-nav__link"
            >
              <span className="site-nav__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{t(item.key)}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <Outlet />

      <footer className="site-footer">
        <div className="site-footer__inner">
          <span>{t('footer.note')}</span>
          <Link to="/privacy">{t('privacy.link')}</Link>
        </div>
      </footer>
    </div>
  );
}
