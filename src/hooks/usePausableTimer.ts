import { useCallback, useEffect, useRef } from 'react';

/**
 * Pause-aware timeout controller.
 * When `isPaused` becomes true, any active timeout is canceled immediately and its
 * remaining time is preserved. When `isPaused` becomes false, the timeout resumes
 * for only the remaining milliseconds.
 */
export function usePausableTimer(isPaused: boolean) {
  const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef<(() => void) | null>(null);
  const startedAtRef = useRef<number>(0);
  const remainingRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(isPaused);

  isPausedRef.current = isPaused;

  const clearRawTimer = useCallback(() => {
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    clearRawTimer();
    callbackRef.current = null;
    remainingRef.current = 0;
  }, [clearRawTimer]);

  const startInternal = useCallback(
    (delayMs: number) => {
      clearRawTimer();
      startedAtRef.current = Date.now();
      remainingRef.current = Math.max(0, delayMs);
      timerIdRef.current = setTimeout(() => {
        timerIdRef.current = null;
        remainingRef.current = 0;
        const cb = callbackRef.current;
        callbackRef.current = null;
        if (cb && !isPausedRef.current) {
          cb();
        }
      }, remainingRef.current);
    },
    [clearRawTimer]
  );

  const schedule = useCallback(
    (cb: () => void, delayMs: number) => {
      clearRawTimer();
      callbackRef.current = cb;
      remainingRef.current = Math.max(0, delayMs);
      if (!isPausedRef.current) {
        startInternal(remainingRef.current);
      }
    },
    [clearRawTimer, startInternal]
  );

  useEffect(() => {
    if (isPaused) {
      if (timerIdRef.current !== null) {
        const elapsed = Date.now() - startedAtRef.current;
        remainingRef.current = Math.max(0, remainingRef.current - elapsed);
        clearRawTimer();
      }
    } else if (callbackRef.current !== null && timerIdRef.current === null) {
      startInternal(remainingRef.current);
    }
  }, [isPaused, clearRawTimer, startInternal]);

  useEffect(() => {
    return () => {
      clearRawTimer();
    };
  }, [clearRawTimer]);

  return { schedule, cancel };
}
