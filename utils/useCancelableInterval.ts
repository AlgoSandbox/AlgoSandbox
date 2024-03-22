import { useCallback, useEffect, useRef, useState } from 'react';

type CancelableInterval = {
  start: () => void;
  stop: () => void;
  isRunning: boolean;
};

export default function useCancelableInterval(
  callback: () => Promise<boolean>,
  delay: number,
): CancelableInterval {
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const [isRunning, setIsRunning] = useState(false);

  const start = useCallback(async () => {
    setIsRunning(true);

    const shouldContinue = await callbackRef.current();

    if (shouldContinue) {
      timeoutId.current = setTimeout(start, delay);
    } else {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        setIsRunning(false);
      }
      timeoutId.current = null;
    }
  }, [delay]);

  const stop = useCallback(() => {
    if (timeoutId.current !== null) {
      clearTimeout(timeoutId.current);
      setIsRunning(false);
      timeoutId.current = null;
    }
  }, []);

  useEffect(() => {
    // Update the callback ref when it changes
    callbackRef.current = callback;
  }, [callback]);

  return { start, stop, isRunning };
}
