import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/context';
import { isFontAvailable } from '../lib/fontDetect';

/**
 * The site title.
 *
 * The wordmark is language-specific by design, including a French version.
 */

/** Pixel faces that can render ideographs, in preference order. */
const CJK_PIXEL_FONTS = ['汉仪像素 11px U', 'HYPixel11pxU', 'Zpix', 'Chill Pixel'];

/**
 * Whether a real pixel CJK font is installed.
 *
 * When one is, the Chinese title uses it directly. When none is — the usual
 * case, since those faces cannot be legally bundled here — the title falls
 * back to a system face plus an SVG filter that blocks the glyphs into pixels,
 * so the wordmark still reads as pixel art instead of looking broken.
 */
function useHasCjkPixelFont(): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        setAvailable(CJK_PIXEL_FONTS.some(isFontAvailable));
      } catch {
        setAvailable(false);
      }
    };
    check();
    // Re-check once web fonts have settled, in case one of them is served.
    void document.fonts?.ready.then(check);
  }, []);

  return available;
}

interface BrandTitleProps {
  /** `compact` is the header wordmark, `hero` is the homepage title. */
  variant?: 'compact' | 'hero';
}

export function BrandTitle({ variant = 'compact' }: BrandTitleProps) {
  const { lang, t } = useI18n();
  const hasPixelFont = useHasCjkPixelFont();
  const isChinese = lang === 'zh';
  const title = isChinese ? '今天做什么菜' : t('brand.title');
  // Only the large hero title is pixelated. At header size the blocks would
  // swallow the strokes and the wordmark would stop being readable.
  const needsFilter = isChinese && !hasPixelFont && variant === 'hero';

  if (variant === 'hero') {
    return (
      <h1 className="hero-title">
        <span className="hero-title__decor" aria-hidden="true">
          🥗
        </span>
        <span
          className={`hero-title__text pixel${needsFilter ? ' pixelate-cjk' : ''}`}
          lang={isChinese ? 'zh-Hans' : lang === 'fr' ? 'fr' : 'en'}
        >
          {title}
        </span>
        <span className="hero-title__decor" aria-hidden="true">
          🍳
        </span>
      </h1>
    );
  }

  return (
    <>
      <span className="brand__mark" aria-hidden="true">
        🍳
      </span>
      <span
        className={`brand__text${needsFilter ? ' pixelate-cjk' : ''}`}
        lang={isChinese ? 'zh-Hans' : lang === 'fr' ? 'fr' : 'en'}
      >
        {title}
      </span>
    </>
  );
}

/**
 * The pixelation filter itself. Rendered once, hidden, and referenced by
 * `.pixelate-cjk`. Blocks the rendered glyphs into 4px squares.
 */
export function PixelateFilter() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        <filter id="wiet-pixelate" x="0" y="0" colorInterpolationFilters="sRGB">
          {/* Sample one pixel out of every 4x4 block, then grow it back out. */}
          <feFlood x="2" y="2" width="1" height="1" floodColor="#000" />
          <feComposite width="4" height="4" />
          <feTile result="grid" />
          <feComposite in="SourceGraphic" in2="grid" operator="in" />
          <feMorphology operator="dilate" radius="2" />
        </filter>
      </defs>
    </svg>
  );
}
