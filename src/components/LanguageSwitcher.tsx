import { useI18n } from '../i18n/context';
import { LANGUAGES, LANG_LABELS, LANG_TAGS } from '../i18n';

/** EN / 中文 / FR. Each button names itself in its own language. */
export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();

  return (
    <div className="lang-switch" role="group" aria-label={t('lang.label')}>
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          className="lang-switch__button"
          lang={LANG_TAGS[code]}
          aria-pressed={code === lang}
          onClick={() => setLang(code)}
        >
          {LANG_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
