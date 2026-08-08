import { useEffect, useMemo, useRef } from 'react';
import { shuffle } from '../lib/random';

/**
 * The rolling picker.
 *
 * The winner is decided before this component ever renders — it only plays
 * back a decision that has already been made. No request, no recalculation and
 * no randomness happens while the strip is moving, so what stops in the window
 * is always exactly what was chosen.
 *
 * It is playful, not a slot machine in the gambling sense: no coins, no
 * jackpot, no flashing. Just a list that scrolls and slows down.
 */

const ITEM_HEIGHT = 52;
/** Index of the marked row inside the three-row window. */
const MARKER_ROW = 1;
const MIN_STRIP = 22;
const SPIN_MS = 2200;

export interface SlotItem {
  id: string;
  name: string;
  emoji?: string;
}

interface SlotMachineProps {
  items: readonly SlotItem[];
  winnerId: string;
  onFinish: () => void;
  /** Announced to screen readers while the strip moves. */
  label: string;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/** Decelerating curve: quick at first, then gently settling. */
function easeOutQuart(progress: number): number {
  return 1 - (1 - progress) ** 4;
}

/**
 * Give this component a `key` that changes on every roll (the spin counter):
 * remounting is what makes each roll build a freshly shuffled strip and replay
 * the animation from the top.
 */
export function SlotMachine({ items, winnerId, onFinish, label }: SlotMachineProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const winner = useMemo(
    () => items.find((item) => item.id === winnerId) ?? items[0],
    [items, winnerId],
  );

  // The strip is rebuilt for each spin so the order looks fresh, and always
  // ends with the winner followed by one filler row.
  const strip = useMemo(() => {
    if (items.length === 0) return [];
    const filler: SlotItem[] = [];
    while (filler.length < MIN_STRIP) filler.push(...shuffle(items));
    const tail = items.length > 1 ? shuffle(items.filter((i) => i.id !== winnerId))[0] : winner;
    return [...filler.slice(0, MIN_STRIP), winner, tail].filter(Boolean);
  }, [items, winnerId, winner]);

  const winnerIndex = Math.max(0, strip.length - 2);

  useEffect(() => {
    const node = stripRef.current;
    if (!node || strip.length === 0) return;

    const target = -(winnerIndex - MARKER_ROW) * ITEM_HEIGHT;

    if (prefersReducedMotion()) {
      node.style.transform = `translateY(${target}px)`;
      const timeout = window.setTimeout(() => finishRef.current(), 250);
      return () => window.clearTimeout(timeout);
    }

    let frame = 0;
    let done = false;
    const start = performance.now();
    const from = 0;

    const settle = () => {
      if (done) return;
      done = true;
      node.style.transform = `translateY(${target}px)`;
      finishRef.current();
    };

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / SPIN_MS);
      const offset = from + (target - from) * easeOutQuart(progress);
      node.style.transform = `translateY(${offset}px)`;
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        settle();
      }
    };

    node.style.transform = 'translateY(0px)';
    frame = requestAnimationFrame(step);

    // Browsers pause requestAnimationFrame in a hidden tab. Without this the
    // roll would stall forever and the user would come back to "Choosing…"
    // with no result — even though the winner was decided before it started.
    const safety = window.setTimeout(settle, SPIN_MS + 400);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(safety);
    };
  }, [strip, winnerIndex]);

  if (strip.length === 0) return null;

  return (
    <div className="slot" role="img" aria-label={label}>
      <div className="slot__window">
        <div className="slot__strip" ref={stripRef}>
          {strip.map((item, index) => (
            <div className="slot__item" key={`${item.id}-${index}`}>
              {item.emoji ? <span aria-hidden="true">{item.emoji}</span> : null}
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="slot__fade slot__fade--top" />
      <div className="slot__fade slot__fade--bottom" />
      <div className="slot__marker" />
    </div>
  );
}
