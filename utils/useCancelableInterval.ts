import { useEffect, useRef, useState } from 'react';

type CancelableInterval = {
  start: () => void;
  stop: () => void;
  isRunning: boolean;
};

export default function useCancelableInterval(
  callback: () => boolean | void,
  delay: number,
): CancelableInterval {
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const [isRunning, setIsRunning] = useState(false);

  const start = () => {
    callbackRef.current();
    setIsRunning(true);
    if (intervalId.current === null) {
      intervalId.current = setInterval(() => {
        const result = callbackRef.current();
        if (result === false) {
          if (intervalId.current) {
            clearInterval(intervalId.current);
            setIsRunning(false);
          }
          intervalId.current = null;
        }
      }, delay);
    }
  };

  const stop = () => {
    if (intervalId.current !== null) {
      clearInterval(intervalId.current);
      setIsRunning(false);
      intervalId.current = null;
    }
  };

  useEffect(() => {
    // Update the callback ref when it changes
    callbackRef.current = callback;
  }, [callback]);

  return { start, stop, isRunning };
}
