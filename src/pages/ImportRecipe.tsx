import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RecipeForm } from '../components/RecipeForm';
import { useI18n } from '../i18n/context';
import { saveRecipe, saveRecipes } from '../db/recipeStore';
import { parseBackupJson } from '../lib/backup';
import { readFileAsText } from '../lib/download';
import { MARKDOWN_EXAMPLE, parseMarkdownFile, type ParsedRecipe } from '../lib/markdown';
import type { Recipe } from '../types/recipe';

type Phase = 'choose' | 'review' | 'restore' | 'done';

/**
 * Markdown import.
 *
 * Parsing never saves anything. Every recipe found in a file is put in front
 * of the user in the normal editing form first, one at a time, so a file that
 * was only half understood can be corrected rather than silently accepted.
 */
export function ImportRecipe() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>('choose');
  const [queue, setQueue] = useState<ParsedRecipe[]>([]);
  const [index, setIndex] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [restorable, setRestorable] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    const name = file.name.toLowerCase();
    if (!name.endsWith('.md') && !name.endsWith('.markdown') && !name.endsWith('.json')) {
      setError(t('import.errorType'));
      return;
    }

    let text: string;
    try {
      text = await readFileAsText(file);
    } catch {
      setError(t('import.errorRead'));
      return;
    }

    if (name.endsWith('.json')) {
      const recipes = parseBackupJson(text);
      if (!recipes) {
        setError(t('import.errorEmpty'));
        return;
      }
      setRestorable(recipes);
      setPhase('restore');
      return;
    }

    const parsed = parseMarkdownFile(text);
    if (parsed.length === 0) {
      setError(t('import.errorEmpty'));
      return;
    }
    setQueue(parsed);
    setIndex(0);
    setSavedCount(0);
    setPhase('review');
  };

  const advance = (didSave: boolean) => {
    const nextSaved = savedCount + (didSave ? 1 : 0);
    setSavedCount(nextSaved);
    if (index + 1 < queue.length) {
      setIndex(index + 1);
    } else {
      setPhase('done');
    }
  };

  const reset = () => {
    setPhase('choose');
    setQueue([]);
    setIndex(0);
    setRestorable([]);
    setError(null);
  };

  /* --- Review one recipe at a time --- */
  if (phase === 'review' && queue[index]) {
    const current = queue[index];
    return (
      <main className="page">
        <header className="page-header">
          <h1 className="page-title">{t('import.title')}</h1>
          <p className="page-subtitle">
            {queue.length === 1
              ? t('import.foundOne')
              : t('import.reviewing', { index: index + 1, total: queue.length })}
          </p>
        </header>

        <RecipeForm
          key={`${index}-${current.draft.name}`}
          initialDraft={current.draft}
          unresolved={current.unresolved}
          submitLabel="form.submitConfirm"
          onSubmit={async (recipe) => {
            await saveRecipe(recipe);
            advance(true);
          }}
          secondaryAction={
            <button type="button" className="btn btn--ghost" onClick={() => advance(false)}>
              {t('import.skip')}
            </button>
          }
          onCancel={reset}
        />
      </main>
    );
  }

  /* --- Restore a JSON backup --- */
  if (phase === 'restore') {
    return (
      <main className="page">
        <header className="page-header">
          <h1 className="page-title">{t('import.title')}</h1>
        </header>
        <div className="stack">
          <div className="notice">
            <span className="notice__icon" aria-hidden="true">
              💾
            </span>
            <span>
              {restorable.length === 1
                ? t('import.foundOne')
                : t('import.foundMany', { count: restorable.length })}
            </span>
          </div>
          <ul className="detail-list">
            {restorable.slice(0, 12).map((recipe) => (
              <li key={recipe.id}>
                <span className="detail-list__marker" aria-hidden="true">
                  ▪
                </span>
                <span>{recipe.name}</span>
              </li>
            ))}
          </ul>
          <div className="row">
            <button
              type="button"
              className="btn btn--primary"
              onClick={async () => {
                await saveRecipes(restorable);
                setSavedCount(restorable.length);
                setPhase('done');
              }}
            >
              {t('form.submitConfirm')}
            </button>
            <button type="button" className="btn btn--ghost" onClick={reset}>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* --- Summary --- */
  if (phase === 'done') {
    return (
      <main className="page">
        <div className="empty">
          <span className="empty__art" aria-hidden="true">
            {savedCount > 0 ? '📚' : '🤔'}
          </span>
          <h1 className="empty__title">
            {savedCount === 0
              ? t('import.nothingSaved')
              : savedCount === 1
                ? t('import.finishedOne')
                : t('import.finished', { count: savedCount })}
          </h1>
          <div className="empty__actions">
            <Link className="btn btn--primary" to="/recipes">
              {t('recipes.title')}
            </Link>
            <button type="button" className="btn" onClick={reset}>
              {t('recipes.import')}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => navigate('/')}>
              {t('nav.tonight')}
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* --- Choose a file --- */
  return (
    <main className="page">
      <header className="page-header">
        <h1 className="page-title">{t('import.title')}</h1>
        <p className="page-subtitle">{t('import.subtitle')}</p>
      </header>

      <div className="stack">
        {error ? (
          <p className="notice notice--error" role="alert">
            <span className="notice__icon" aria-hidden="true">
              ⚠
            </span>
            <span>{error}</span>
          </p>
        ) : null}

        <div
          className={`dropzone${dragging ? ' dropzone--active' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const file = event.dataTransfer.files[0];
            if (file) void handleFile(file);
          }}
        >
          <span style={{ fontSize: '2rem' }} aria-hidden="true">
            📄
          </span>
          <p>{t('import.drop')}</p>
          <p className="field__hint">{t('import.or')}</p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => fileInput.current?.click()}
          >
            {t('import.choose')}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".md,.markdown,.json,text/markdown,application/json"
            className="visually-hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
              event.target.value = '';
            }}
          />
        </div>

        <hr className="pixel-rule" />

        <section className="question">
          <h2 className="question__title">{t('import.formatTitle')}</h2>
          <p className="field__hint">{t('import.formatIntro')}</p>
          <pre className="code-block">{MARKDOWN_EXAMPLE}</pre>
          <p className="field__hint">{t('import.formatNote')}</p>
        </section>
      </div>
    </main>
  );
}
