import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandTitle } from '../components/BrandTitle';
import { SlotMachine, type SlotItem } from '../components/SlotMachine';
import { CATEGORY_EMOJI, ingredientEmoji } from '../data/foodEmoji';
import { useI18n } from '../i18n/context';
import { useRecipes } from '../db/recipeStore';
import { readExtraIngredients, rememberPick, readRecentPicks, writeExtraIngredients } from '../db/prefs';
import {
  buildMenu,
  buildPools,
  collectIngredients,
  pickWinner,
  type Menu,
  type ScoredRecipe,
  type TonightPools,
} from '../lib/matching';
import { OCCASION_ICONS } from '../lib/labels';
import { formatDuration, recipeDisplayName } from '../lib/recipe';
import { joinNames } from '../lib/labels';
import { RECIPE_OCCASIONS, type RecipeOccasion } from '../types/recipe';

const TIME_OPTIONS = [15, 30, 45, 60] as const;
const VISIBLE_CHIPS = 18;

type Phase = 'idle' | 'spinning' | 'result';

interface Decision {
  /** What the roll chooses between. Shown in the slot and in "picked from". */
  pool: ScoredRecipe[];
  /** Everything that passed the filters, used to build the other courses. */
  menuPool: ScoredRecipe[];
  winner: ScoredRecipe;
  menu?: Menu;
}

/**
 * For a proper dinner the roll should land on a main course, with the starter
 * and dessert built around it — so the pool narrows to mains when there are
 * any. Otherwise everything that fits stays in the running.
 */
function candidatePool(pool: ScoredRecipe[], occasion: RecipeOccasion | null) {
  if (occasion !== 'formal') return pool;
  const mains = pool.filter((item) => item.recipe.category === 'main');
  return mains.length > 0 ? mains : pool;
}

export function Tonight() {
  const { t, lang } = useI18n();
  const { recipes, status } = useRecipes();

  const [selected, setSelected] = useState<string[]>([]);
  const [extras, setExtras] = useState<string[]>(() => readExtraIngredients());
  const [customIngredient, setCustomIngredient] = useState('');
  const [showAllChips, setShowAllChips] = useState(false);
  const [maxMinutes, setMaxMinutes] = useState<number | null>(null);
  const [occasion, setOccasion] = useState<RecipeOccasion | null>(null);
  const [includeAlmost, setIncludeAlmost] = useState(false);
  const [ignoreIngredients, setIgnoreIngredients] = useState(false);

  const [phase, setPhase] = useState<Phase>('idle');
  const [decision, setDecision] = useState<Decision | null>(null);
  const [spinKey, setSpinKey] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [noMatch, setNoMatch] = useState<TonightPools | null>(null);

  const ingredientOptions = useMemo(
    () => collectIngredients(recipes, extras),
    [recipes, extras],
  );

  // Live preview of how many recipes currently fit, before anything is rolled.
  const preview = useMemo(
    () =>
      buildPools(recipes, {
        ingredients: ignoreIngredients ? [] : selected,
        maxMinutes,
        occasion,
      }),
    [recipes, selected, maxMinutes, occasion, ignoreIngredients],
  );

  const previewPool = includeAlmost
    ? [...preview.ready, ...preview.almost]
    : preview.ready;

  const toggleIngredient = (name: string) => {
    setSelected((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  };

  const addCustomIngredient = (event: React.FormEvent) => {
    event.preventDefault();
    const name = customIngredient.trim();
    if (!name) return;
    if (!ingredientOptions.some((option) => option.key === name.toLocaleLowerCase())) {
      const nextExtras = [...extras, name];
      setExtras(nextExtras);
      writeExtraIngredients(nextExtras);
    }
    setSelected((current) => (current.includes(name) ? current : [...current, name]));
    setCustomIngredient('');
  };

  /** Step 1–3 of the pick: decide everything, then start the animation. */
  const roll = (options: { relaxAlmost?: boolean; relaxTime?: boolean; relaxOccasion?: boolean; relaxIngredients?: boolean } = {}) => {
    const nextIncludeAlmost = options.relaxAlmost ?? includeAlmost;
    const nextMax = options.relaxTime ? null : maxMinutes;
    const nextOccasion = options.relaxOccasion ? null : occasion;
    const nextIgnore = options.relaxIngredients ?? ignoreIngredients;

    if (options.relaxAlmost !== undefined) setIncludeAlmost(nextIncludeAlmost);
    if (options.relaxTime) setMaxMinutes(null);
    if (options.relaxOccasion) setOccasion(null);
    if (options.relaxIngredients) setIgnoreIngredients(true);

    const pools = buildPools(recipes, {
      ingredients: nextIgnore ? [] : selected,
      maxMinutes: nextMax,
      occasion: nextOccasion,
    });
    const menuPool = nextIncludeAlmost
      ? [...pools.ready, ...pools.almost]
      : pools.ready;
    const pool = candidatePool(menuPool, nextOccasion);

    if (pool.length === 0) {
      setNoMatch(pools);
      setPhase('idle');
      setDecision(null);
      return;
    }

    const recent = readRecentPicks();
    const winner = pickWinner(pool, { recentIds: recent });
    if (!winner) return;

    // Everything is decided here, before a single frame is drawn.
    const menu =
      nextOccasion === 'formal'
        ? buildMenu(winner, menuPool, { recentIds: recent })
        : undefined;

    setNoMatch(null);
    setDecision({ pool, menuPool, winner, menu });
    setShowMenu(Boolean(menu));
    setSpinKey((key) => key + 1);
    setPhase('spinning');
  };

  /** Re-draws from the pool that was already calculated. No filters re-run. */
  const rollAgain = () => {
    if (!decision) return;
    const recent = readRecentPicks();
    const winner = pickWinner(decision.pool, {
      recentIds: recent,
      excludeId: decision.winner.recipe.id,
    });
    if (!winner) return;
    const menu =
      occasion === 'formal'
        ? buildMenu(winner, decision.menuPool, { recentIds: recent })
        : undefined;
    setDecision({ ...decision, winner, menu });
    setShowMenu(Boolean(menu));
    setSpinKey((key) => key + 1);
    setPhase('spinning');
  };

  const finishSpin = () => {
    setPhase('result');
    if (decision) rememberPick(decision.winner.recipe.id);
  };

  const slotItems: SlotItem[] = useMemo(
    () =>
      (decision?.pool ?? []).map((item) => ({
        id: item.recipe.id,
        name: recipeDisplayName(item.recipe, lang),
        emoji: item.recipe.emoji || CATEGORY_EMOJI[item.recipe.category],
      })),
    [decision, lang],
  );

  const visibleChips = showAllChips
    ? ingredientOptions
    : ingredientOptions.slice(0, VISIBLE_CHIPS);

  if (status === 'ready' && recipes.length === 0) {
    return (
      <main className="page">
        <Hero />
        <div className="empty">
          <span className="empty__art" aria-hidden="true">
            🍽️
          </span>
          <h2 className="empty__title">{t('tonight.noRecipes.title')}</h2>
          <p className="empty__body">{t('tonight.noRecipes.body')}</p>
          <div className="empty__actions">
            <Link className="btn btn--primary" to="/recipes/new">
              {t('tonight.noRecipes.create')}
            </Link>
            <Link className="btn" to="/inspiration">
              {t('tonight.noRecipes.inspiration')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <Hero />

      {phase === 'idle' ? (
        <div className="stack">
          {/* --- Question 1 --- */}
          <section className="question" aria-labelledby="q-have">
            <h2 className="question__title" id="q-have">
              {t('tonight.q1.title')}
              {selected.length > 0 ? (
                <span className="question__count">
                  {t('tonight.q1.selected', { count: selected.length })}
                </span>
              ) : null}
            </h2>
            <p className="question__hint">{t('tonight.q1.hint')}</p>

            {ingredientOptions.length === 0 ? (
              <p className="notice">{t('tonight.q1.empty')}</p>
            ) : (
              <div className="chip-group">
                {visibleChips.map((option) => {
                  const emoji = ingredientEmoji(option.name);
                  const isOn = selected.includes(option.name);
                  return (
                    <button
                      key={option.key}
                      type="button"
                      className="chip"
                      aria-pressed={isOn}
                      onClick={() => toggleIngredient(option.name)}
                    >
                      {emoji ? (
                        <span className="chip__icon" aria-hidden="true">
                          {emoji}
                        </span>
                      ) : null}
                      {option.name}
                    </button>
                  );
                })}
                {ingredientOptions.length > VISIBLE_CHIPS ? (
                  <button
                    type="button"
                    className="btn btn--ghost btn--small"
                    onClick={() => setShowAllChips((value) => !value)}
                  >
                    {showAllChips
                      ? t('tonight.q1.showLess')
                      : t('tonight.q1.showMore', { count: ingredientOptions.length })}
                  </button>
                ) : null}
              </div>
            )}

            <form className="row" onSubmit={addCustomIngredient}>
              <input
                className="input"
                style={{ maxWidth: 240 }}
                value={customIngredient}
                placeholder={t('tonight.q1.addPlaceholder')}
                aria-label={t('tonight.q1.add')}
                onChange={(event) => setCustomIngredient(event.target.value)}
              />
              <button type="submit" className="btn btn--soft btn--small">
                + {t('tonight.q1.addSubmit')}
              </button>
              {selected.length > 0 ? (
                <button
                  type="button"
                  className="btn btn--ghost btn--small"
                  onClick={() => {
                    setSelected([]);
                    setIgnoreIngredients(false);
                  }}
                >
                  {t('tonight.q1.clear')}
                </button>
              ) : null}
            </form>
          </section>

          <hr className="pixel-rule" />

          {/* --- Question 2 --- */}
          <section className="question" aria-labelledby="q-time">
            <h2 className="question__title" id="q-time">
              {t('tonight.q2.title')}
            </h2>
            <div className="chip-group">
              {TIME_OPTIONS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className="chip"
                  aria-pressed={maxMinutes === minutes}
                  onClick={() => setMaxMinutes(minutes)}
                >
                  {t('common.minutes', { count: minutes })}
                </button>
              ))}
              <button
                type="button"
                className="chip"
                aria-pressed={maxMinutes === null}
                onClick={() => setMaxMinutes(null)}
              >
                {t('tonight.q2.noLimit')}
              </button>
            </div>
          </section>

          <hr className="pixel-rule" />

          {/* --- Question 3 --- */}
          <section className="question" aria-labelledby="q-kind">
            <h2 className="question__title" id="q-kind">
              {t('tonight.q3.title')}
            </h2>
            <div className="option-grid">
              {RECIPE_OCCASIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className="option"
                  aria-pressed={occasion === value}
                  onClick={() => setOccasion((current) => (current === value ? null : value))}
                >
                  <span className="option__icon" aria-hidden="true">
                    {OCCASION_ICONS[value]}
                  </span>
                  <span>{t(`occasion.short.${value}`)}</span>
                </button>
              ))}
            </div>
          </section>

          {/* --- The one button --- */}
          <div className="tonight-cta">
            <button
              type="button"
              className="btn btn--primary btn--cta"
              onClick={() => roll()}
              disabled={recipes.length === 0}
            >
              <span aria-hidden="true">🍳</span>
              {t('tonight.cta')}
            </button>
            <p className="tonight-cta__count" aria-live="polite">
              {previewPool.length === 1
                ? t('tonight.poolSizeOne')
                : t('tonight.poolSize', { count: previewPool.length })}
            </p>
          </div>

          {noMatch ? (
            <NoMatch
              pools={noMatch}
              hasIngredients={selected.length > 0 && !ignoreIngredients}
              hasTime={maxMinutes !== null}
              hasOccasion={occasion !== null}
              onShowAlmost={() => roll({ relaxAlmost: true })}
              onRelaxTime={() => roll({ relaxTime: true })}
              onRelaxOccasion={() => roll({ relaxOccasion: true })}
              onRelaxIngredients={() => roll({ relaxIngredients: true })}
            />
          ) : null}
        </div>
      ) : null}

      {phase !== 'idle' && decision ? (
        <div className="stack">
          {phase === 'spinning' ? (
            <>
              <p className="tonight-rolling pixel">{t('tonight.rolling')}</p>
              <SlotMachine
                key={spinKey}
                items={slotItems}
                winnerId={decision.winner.recipe.id}
                onFinish={finishSpin}
                label={t('tonight.rolling')}
              />
            </>
          ) : (
            <Result
              decision={decision}
              showMenu={showMenu}
              onToggleMenu={() => setShowMenu((value) => !value)}
              onRollAgain={rollAgain}
              onBack={() => {
                setPhase('idle');
                setDecision(null);
              }}
            />
          )}
        </div>
      ) : null}
    </main>
  );
}

function Hero() {
  const { t } = useI18n();
  return (
    <header className="hero">
      <BrandTitle variant="hero" />
      <p className="hero-tagline">{t('brand.tagline')}</p>
    </header>
  );
}

/* --- Result ---------------------------------------------------------------- */

interface ResultProps {
  decision: Decision;
  showMenu: boolean;
  onToggleMenu: () => void;
  onRollAgain: () => void;
  onBack: () => void;
}

function Result({ decision, showMenu, onToggleMenu, onRollAgain, onBack }: ResultProps) {
  const { t, lang } = useI18n();
  const { winner, pool, menu } = decision;
  const recipe = winner.recipe;
  const emoji = recipe.emoji || CATEGORY_EMOJI[recipe.category];
  const percent = Math.round(winner.score * 100);

  return (
    <>
      <div className="result">
        <span className="result__emoji" aria-hidden="true">
          {emoji}
        </span>
        <p className="result__label">{t('tonight.result.prefix')}</p>
        <h2 className="result__name">{recipeDisplayName(recipe, lang)}</h2>

        <p className="result__meta">
          <span>{formatDuration(recipe.durationMinutes, t)}</span>
          <span>·</span>
          <span>{t(`category.${recipe.category}`)}</span>
          {winner.scoreApplies ? (
            <>
              <span>·</span>
              <span className={winner.missing.length === 0 ? 'badge badge--ok' : 'badge badge--warn'}>
                {winner.missing.length === 0
                  ? t('tonight.matchFull')
                  : t('tonight.match', { percent })}
              </span>
            </>
          ) : null}
        </p>

        {winner.missing.length > 0 ? (
          <p className="result__meta">
            <span aria-hidden="true">🛒</span>
            {t('tonight.missing')}: {joinNames(winner.missing, lang)}
          </p>
        ) : null}

        <div className="result__actions">
          <Link className="btn btn--primary" to={`/recipes/${recipe.id}`}>
            {t('tonight.result.keep')}
          </Link>
          <button
            type="button"
            className="btn"
            onClick={onRollAgain}
            disabled={pool.length < 2}
          >
            <span aria-hidden="true">🎲</span> {t('tonight.result.again')}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            {t('common.back')}
          </button>
        </div>

        {pool.length < 2 ? (
          <p className="field__hint">{t('tonight.result.onlyOne')}</p>
        ) : null}
      </div>

      {menu ? (
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3 className="question__title" style={{ fontSize: 'var(--text-md)' }}>
              {t('tonight.menu.title')}
            </h3>
            <button type="button" className="btn btn--ghost btn--small" onClick={onToggleMenu}>
              {showMenu ? t('tonight.menu.mainOnly') : t('tonight.menu.full')}
            </button>
          </div>
          {showMenu ? (
            <>
              {menu.starter ? (
                <Course labelKey="tonight.menu.starter" scored={menu.starter} />
              ) : null}
              <Course labelKey="tonight.menu.main" scored={menu.main} />
              {menu.dessert ? (
                <Course labelKey="tonight.menu.dessert" scored={menu.dessert} />
              ) : null}
              <p className="field__hint" style={{ marginTop: 'var(--space-3)' }}>
                {t('tonight.menu.total', {
                  time: formatDuration(menu.totalMinutes, t),
                })}
              </p>
            </>
          ) : null}
        </div>
      ) : null}

      <details className="card card--flat">
        <summary>
          {t('tonight.candidates')} · {pool.length}
        </summary>
        <div className="stack-sm" style={{ marginTop: 'var(--space-4)' }}>
          <CandidateGroup
            titleKey="tonight.groups.ready"
            hintKey="tonight.groups.readyHint"
            items={pool.filter((item) => item.missing.length === 0)}
          />
          <CandidateGroup
            titleKey="tonight.groups.almost"
            hintKey="tonight.groups.almostHint"
            items={pool.filter((item) => item.missing.length > 0)}
          />
        </div>
      </details>
    </>
  );
}

/**
 * "Ready to cook" and "Almost there".
 *
 * The score is an ingredient count and is labelled as such — it is not a
 * confidence, and nothing here was guessed.
 */
function CandidateGroup({
  titleKey,
  hintKey,
  items,
}: {
  titleKey: 'tonight.groups.ready' | 'tonight.groups.almost';
  hintKey: 'tonight.groups.readyHint' | 'tonight.groups.almostHint';
  items: ScoredRecipe[];
}) {
  const { t, lang } = useI18n();
  if (items.length === 0) return null;
  const isReady = titleKey === 'tonight.groups.ready';

  return (
    <section>
      <h4 className="candidate-group__title">
        <span aria-hidden="true">{isReady ? '✅' : '🛒'}</span> {t(titleKey)}
        <span className="field__hint"> — {t(hintKey)}</span>
      </h4>
      <ul className="detail-list" style={{ marginTop: 'var(--space-2)' }}>
        {items.map((item) => (
          <li key={item.recipe.id}>
            <span className="detail-list__marker" aria-hidden="true">
              ▪
            </span>
            <Link to={`/recipes/${item.recipe.id}`}>{recipeDisplayName(item.recipe, lang)}</Link>
            <span className="detail-list__qty">
              {formatDuration(item.recipe.durationMinutes, t)}
              {item.scoreApplies
                ? ` · ${t('tonight.match', { percent: Math.round(item.score * 100) })}`
                : ''}
            </span>
            {item.missing.length > 0 ? (
              <span className="badge badge--warn">
                {t('tonight.missing')}: {joinNames(item.missing, lang)}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Course({
  labelKey,
  scored,
}: {
  labelKey: 'tonight.menu.starter' | 'tonight.menu.main' | 'tonight.menu.dessert';
  scored: ScoredRecipe;
}) {
  const { t, lang } = useI18n();
  return (
    <div className="menu-course">
      <span className="menu-course__label">{t(labelKey)}</span>
      <span className="menu-course__name">
        <Link to={`/recipes/${scored.recipe.id}`}>{recipeDisplayName(scored.recipe, lang)}</Link>
      </span>
      <span className="menu-course__time">
        {formatDuration(scored.recipe.durationMinutes, t)}
      </span>
    </div>
  );
}

/* --- Empty result ---------------------------------------------------------- */

interface NoMatchProps {
  pools: TonightPools;
  hasIngredients: boolean;
  hasTime: boolean;
  hasOccasion: boolean;
  onShowAlmost: () => void;
  onRelaxTime: () => void;
  onRelaxOccasion: () => void;
  onRelaxIngredients: () => void;
}

function NoMatch({
  pools,
  hasIngredients,
  hasTime,
  hasOccasion,
  onShowAlmost,
  onRelaxTime,
  onRelaxOccasion,
  onRelaxIngredients,
}: NoMatchProps) {
  const { t } = useI18n();

  return (
    <div className="empty card card--pink" role="status">
      <span className="empty__art" aria-hidden="true">
        🧊
      </span>
      <h2 className="empty__title">{t('tonight.empty.title')}</h2>
      <p className="empty__body">{t('tonight.empty.playful')}</p>

      <ul className="detail-list" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
        {pools.rejected.occasion > 0 ? (
          <li>{t('tonight.empty.reasonOccasion', { count: pools.rejected.occasion })}</li>
        ) : null}
        {pools.rejected.time > 0 ? (
          <li>{t('tonight.empty.reasonTime', { count: pools.rejected.time })}</li>
        ) : null}
        {pools.rejected.ingredients > 0 ? (
          <li>{t('tonight.empty.reasonIngredients', { count: pools.rejected.ingredients })}</li>
        ) : null}
      </ul>

      <div className="empty__actions">
        {pools.almost.length > 0 ? (
          <button type="button" className="btn btn--primary" onClick={onShowAlmost}>
            {t('tonight.empty.showAlmost')}
          </button>
        ) : null}
        {hasTime ? (
          <button type="button" className="btn" onClick={onRelaxTime}>
            {t('tonight.empty.relaxTime')}
          </button>
        ) : null}
        {hasOccasion ? (
          <button type="button" className="btn" onClick={onRelaxOccasion}>
            {t('tonight.empty.relaxOccasion')}
          </button>
        ) : null}
        {hasIngredients ? (
          <button type="button" className="btn" onClick={onRelaxIngredients}>
            {t('tonight.empty.relaxIngredients')}
          </button>
        ) : null}
        <Link className="btn btn--ghost" to="/inspiration">
          {t('tonight.empty.inspiration')}
        </Link>
      </div>
    </div>
  );
}
