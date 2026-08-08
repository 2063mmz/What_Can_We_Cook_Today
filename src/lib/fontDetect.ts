/**
 * Detects whether a font is actually available on this machine.
 *
 * `document.fonts.check()` cannot be used for this: it returns true for names
 * that do not exist at all. The reliable approach is to render text twice —
 * once with the candidate font in front of a generic family, once with the
 * generic family alone — and compare the widths. A difference means the
 * candidate was really used.
 */

const GENERIC_FAMILIES = ['monospace', 'sans-serif', 'serif'] as const;
/** Mixes Latin and ideographs so either script can reveal the difference. */
const SAMPLE = '今天做什么菜MWmwil';
const SIZE = 72;

const cache = new Map<string, boolean>();
let context: CanvasRenderingContext2D | null | undefined;

function getContext(): CanvasRenderingContext2D | null {
  if (context === undefined) {
    context = document.createElement('canvas').getContext('2d');
  }
  return context;
}

export function isFontAvailable(name: string): boolean {
  const cached = cache.get(name);
  if (cached !== undefined) return cached;

  const ctx = getContext();
  if (!ctx) return false;

  const available = GENERIC_FAMILIES.some((generic) => {
    ctx.font = `${SIZE}px ${generic}`;
    const baseline = ctx.measureText(SAMPLE).width;
    ctx.font = `${SIZE}px "${name}", ${generic}`;
    return ctx.measureText(SAMPLE).width !== baseline;
  });

  cache.set(name, available);
  return available;
}
