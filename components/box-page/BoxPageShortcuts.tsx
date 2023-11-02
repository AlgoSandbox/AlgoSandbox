import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { useBoxControlsContext } from './BoxControlsContextProvider';

export default function BoxPageShortcuts({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    play,
    isPlaying,
    stop,
    previous,
    next,
    hasNext,
    restartAndPlay,
    skipToStart,
    skipToEnd,
  } = useBoxControlsContext();

  const space = useCallback(() => {
    if (isPlaying) {
      stop();
    } else if (hasNext) {
      play();
    } else {
      restartAndPlay();
    }
  }, [hasNext, isPlaying, play, restartAndPlay, stop]);

  const left = useCallback(() => {
    if (!isPlaying) {
      previous();
    }
  }, [isPlaying, previous]);

  const right = useCallback(() => {
    if (!isPlaying) {
      next();
    }
  }, [isPlaying, next]);

  const shiftLeft = useCallback(() => {
    if (!isPlaying) {
      skipToStart();
    }
  }, [isPlaying, skipToStart]);

  const shiftRight = useCallback(() => {
    if (!isPlaying) {
      skipToEnd();
    }
  }, [isPlaying, skipToEnd]);

  useHotkeys('space', space, [space]);
  useHotkeys('left', left, [left]);
  useHotkeys('right', right, [right]);
  useHotkeys('shift+left', shiftLeft, [shiftLeft]);
  useHotkeys('shift+right', shiftRight, [shiftRight]);

  return children;
}
