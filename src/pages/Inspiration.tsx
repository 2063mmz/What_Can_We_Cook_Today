import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlotMachine, type SlotItem } from '../components/SlotMachine';
import { useI18n } from '../i18n/context';
import {
  externalToDraft,
  inspirationProvider,
  type ExternalRecipe,
  type ExternalSummary,
} from '../api/inspiration';
import { getCountry } from '../data/countries';
import { pickRandom } from '../lib/random';
import { translateShortText, translateTitleSet } from '../api/inspiration/translate';

type Phase = 'idle' | 'loading' | 'spinning' | 'result' | 'empty' | 'error';

const RANDOM_DRAW = 6;

/**
 * Inspiration.
 *
 * The only page that talks to the network. It is deliberately separate from
 * Tonight: Tonight uses the recipes you actually keep, this one is for
 * browsing ideas from outside. If the source is unreachable, nothing else in
 * the app is affected.
 */
export function Inspiration() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const [ingredient, setIngredient] = useState('');

  const [phase, setPhase] = useState<Phase>('idle');
  const [slotItems, setSlotItems] = useState<SlotItem[]>([]);
  const [winner, setWinner] = useState<ExternalRecipe | null>(null);
  const [winnerName, setWinnerName] = useState('');
  const [spinKey, setSpinKey] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [adding, setAdding] = useState(false);
  /** Random draws already fetched, reused so "another one" is instant. */
  const randomBuffer = useRef<ExternalRecipe[]>([]);

  const hasFilters = Boolean(ingredient.trim());

  const prepareSpin = async (
    nextPool: ExternalSummary[],
    nextWinner: ExternalRecipe,
  ) => {
    const [items, localizedWinner] = await Promise.all([
      Promise.all(
        nextPool.map(async (item) => ({
          id: item.id,
          name: await translateShortText(item.name, item.sourceLanguage, lang),
        })),
      ),
      translateShortText(nextWinner.name, nextWinner.sourceLanguage, lang),
    ]);
    setSlotItems(items);
    setWinner(nextWinner);
    setWinnerName(localizedWinner);
    setSpinKey((key) => key + 1);
    setPhase('spinning');
  };

  /** Fetches everything needed, then starts the animation. Never during. */
  const find = async (options: { exclude?: string } = {}) => {
    setPhase('loading');
    setShowDetails(false);
    try {
      if (!hasFilters) {
        let buffer = randomBuffer.current.filter((item) => item.id !== options.exclude);
        if (buffer.length === 0) {
          buffer = await inspirationProvider.getRandom(RANDOM_DRAW);
          buffer = buffer.filter((item) => item.id !== options.exclude);
        }
        if (buffer.length === 0) {
          setPhase('empty');
          return;
        }
        const chosen = pickRandom(buffer)!;
        randomBuffer.current = buffer.filter((item) => item.id !== chosen.id);
        await prepareSpin(
          buffer.map((item) => ({
            id: item.id,
            name: item.name,
            sourceLanguage: item.sourceLanguage,
          })),
          chosen,
        );
        return;
      }

      const query = ingredient.trim();
      const translatedQueries = query
        ? { en: await translateShortText(query, lang, 'en') }
        : undefined;

      const candidates = await inspirationProvider.findCandidates({
        ingredient: query || undefined,
        translatedQueries,
      });
      if (candidates.length === 0) {
        setSlotItems([]);
        setPhase('empty');
        return;
      }

      const choices =
        candidates.length > 1 && options.exclude
          ? candidates.filter((item) => item.id !== options.exclude)
          : candidates;
      const chosen = pickRandom(choices)!;
      const details = await inspirationProvider.getById(chosen.id);
      if (!details) {
        setPhase('empty');
        return;
      }
      const rollingPool = candidates.slice(0, 18);
      if (!rollingPool.some((item) => item.id === chosen.id)) rollingPool.push(chosen);
      await prepareSpin(rollingPool, details);
    } catch {
      setPhase('error');
    }
  };

  const country = getCountry(winner?.countryCode);

  return (
    <main className="page">
      <header className="page-header">
        <h1 className="page-title">{t('inspiration.title')}</h1>
        <p className="page-subtitle">{t('inspiration.subtitle')}</p>
      </header>

      <div className="stack">
        <section className="question">
          <div className="toolbar">
            <div className="toolbar__grow">
              <input
                className="input"
                value={ingredient}
                placeholder={t('inspiration.filterIngredientPlaceholder')}
                aria-label={t('inspiration.filterIngredient')}
                onChange={(event) => setIngredient(event.target.value)}
              />
            </div>
          </div>
          <p className="field__hint">{t('inspiration.localNote')}</p>
        </section>

        {phase === 'idle' || phase === 'empty' || phase === 'error' ? (
          <div className="tonight-cta">
            <button
              type="button"
              className="btn btn--primary btn--cta"
              onClick={() => void find()}
            >
              <span aria-hidden="true">✨</span>
              {t('inspiration.cta')}
            </button>
          </div>
        ) : null}

        {phase === 'loading' ? (
          <p className="tonight-rolling pixel" aria-live="polite">
            {t('inspiration.rolling')}
          </p>
        ) : null}

        {phase === 'error' ? (
          <div className="notice notice--error" role="alert">
            <span className="notice__icon" aria-hidden="true">
              ⚠
            </span>
            <span className="row" style={{ flex: 1, justifyContent: 'space-between' }}>
              {t('inspiration.error')}
              <button
                type="button"
                className="btn btn--small"
                onClick={() => void find()}
              >
                {t('common.retry')}
              </button>
            </span>
          </div>
        ) : null}

        {phase === 'empty' ? (
          <div className="empty card card--pink" role="status">
            <span className="empty__art" aria-hidden="true">
              🫙
            </span>
            <p className="empty__body">{t('inspiration.empty')}</p>
            <p className="field__hint">{t('inspiration.emptyHint')}</p>
          </div>
        ) : null}

        {phase === 'spinning' && winner ? (
          <SlotMachine
            key={spinKey}
            items={slotItems.length > 0 ? slotItems : [{ id: winner.id, name: winner.name }]}
            winnerId={winner.id}
            onFinish={() => setPhase('result')}
            label={t('inspiration.rolling')}
          />
        ) : null}

        {phase === 'result' && winner ? (
          <>
            <div className="result">
              <p className="result__label">{t('inspiration.title')}</p>
              <h2 className="result__name">{winnerName || winner.name}</h2>
              <p className="result__meta">
                {country ? (
                  <span>
                    <span className="meta-icon" aria-hidden="true">{country.flag}</span>
                    {country.names[lang]}
                  </span>
                ) : winner.area ? (
                  <span>{winner.area}</span>
                ) : null}
                {winner.category ? (
                  <>
                    <span>·</span>
                    <span>{winner.category}</span>
                  </>
                ) : null}
              </p>
              {/* The source publishes no cooking time, and we do not guess one. */}
              <p className="field__hint">{t('inspiration.noDuration')}</p>

              <div className="result__actions">
                <button
                  type="button"
                  className="btn btn--soft"
                  onClick={() => setShowDetails((value) => !value)}
                >
                  {showDetails ? t('inspiration.hide') : t('inspiration.view')}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => void find({ exclude: winner.id })}
                >
                  <span aria-hidden="true">🎲</span> {t('inspiration.another')}
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={adding}
                  onClick={() => {
                    setAdding(true);
                    void translateTitleSet(winner.name, winner.sourceLanguage)
                      .then((localizedNames) =>
                        navigate('/recipes/new', {
                          state: {
                            draft: externalToDraft(winner, localizedNames),
                            fromExternal: true,
                          },
                        }),
                      )
                      .finally(() => setAdding(false));
                  }}
                >
                  {adding ? t('common.loading') : t('inspiration.addToMine')}
                </button>
              </div>
            </div>

            {showDetails ? (
              <div className="card inspiration-card">
                {winner.thumbnail ? (
                  <img
                    className="inspiration-card__image"
                    src={winner.thumbnail}
                    alt=""
                    loading="lazy"
                  />
                ) : null}

                <section className="question">
                  <h3 className="question__title" style={{ fontSize: 'var(--text-md)' }}>
                    {t('detail.ingredients')}
                  </h3>
                  <ul className="detail-list">
                    {winner.ingredients.map((item, index) => (
                      <li key={`${item.name}-${index}`}>
                        <span className="detail-list__marker" aria-hidden="true">
                          ▪
                        </span>
                        <span>{item.name}</span>
                        {item.measure ? (
                          <span className="detail-list__qty">{item.measure}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="question">
                  <h3 className="question__title" style={{ fontSize: 'var(--text-md)' }}>
                    {t('detail.instructions')}
                  </h3>
                  <p className="inspiration-card__steps">{winner.instructions}</p>
                </section>

                <div className="toolbar">
                  {winner.sourceUrl ? (
                    <a
                      className="btn btn--small"
                      href={winner.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {t('inspiration.sourceLink')}
                    </a>
                  ) : null}
                  {winner.videoUrl ? (
                    <a
                      className="btn btn--small btn--ghost"
                      href={winner.videoUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {t('inspiration.video')}
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        <hr className="pixel-rule" />

        <p className="field__hint">
          {t('inspiration.credit')}{' '}
          <a
            href={inspirationProvider.homepage}
            target="_blank"
            rel="noreferrer noopener"
          >
            {inspirationProvider.name}
          </a>
        </p>
      </div>
    </main>
  );
}
