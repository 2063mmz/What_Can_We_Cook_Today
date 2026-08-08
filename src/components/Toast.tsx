import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A single short confirmation message.
 *
 * Announced politely so screen readers hear "recipe saved" without the message
 * stealing focus.
 */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((text: string) => {
    setMessage(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(null), 3600);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const element = (
    <div aria-live="polite" aria-atomic="true">
      {message ? <p className="toast">{message}</p> : null}
    </div>
  );

  return { show, element };
}
