import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { Button, Input, MaterialSymbol, Popover } from '@components/ui';
import Heading, { HeadingContent } from '@components/ui/Heading';
import RadioButtons from '@components/ui/RadioButtons';
import { ComponentPropsWithRef, useCallback, useState } from 'react';

import {
  PlaybackSpeed,
  useBoxControlsContext,
} from './BoxControlsContextProvider';

type ButtonProps = ComponentPropsWithRef<typeof Button>;
type AsyncButtonProps = Omit<ButtonProps, 'onClick' | 'selected'> & {
  onClick: () => Promise<unknown>;
};

function AsyncButton({ icon, onClick, disabled, ...props }: AsyncButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleClick = useCallback(async () => {
    setLoading(true);
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    const newTimeoutId = setTimeout(() => {
      setShowLoading(true);
    }, 2000);
    setTimeoutId(newTimeoutId);

    try {
      await onClick();
    } finally {
      clearTimeout(newTimeoutId);
      setTimeoutId(null);
      setLoading(false);
      setShowLoading(false);
    }
  }, [onClick, timeoutId]);

  return (
    <Button
      onClick={handleClick}
      icon={
        showLoading ? (
          <MaterialSymbol className="animate-spin" icon="progress_activity" />
        ) : (
          icon
        )
      }
      disabled={loading || disabled}
      {...props}
    />
  );
}

export default function BoxExecutionControls() {
  const {
    currentStepIndex,
    previous,
    maxSteps,
    hasPrevious,
    hasNext,
    next,
    play,
    skipToStart,
    skipToEnd,
    stop,
    restartAndPlay,
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    isExecuting,
  } = useBoxControlsContext();

  const { maxExecutionStepCount, setMaxExecutionStepCount } =
    useUserPreferences();

  return (
    <div className="flex flex-1 flex-col items-center relative">
      <span className="lg:hidden font-mono absolute rounded-full -top-1 px-2 text-sm text-label bg-surface border -translate-y-full">
        {currentStepIndex + 1}/{maxSteps ?? '?'}
      </span>
      <div className="flex self-stretch justify-between items-center gap-2">
        <span className="hidden lg:block font-mono px-2 rounded-full bg-surface border">
          {currentStepIndex + 1}/{maxSteps ?? '?'}
        </span>
        <div className="lg:hidden w-10" />
        <div className="flex gap-2 items-end">
          <AsyncButton
            disabled={isPlaying || isExecuting || !hasPrevious}
            label="Skip to start (Shift + left)"
            hideLabel
            onClick={skipToStart}
            icon={<MaterialSymbol icon="first_page" />}
          />
          <AsyncButton
            disabled={isPlaying || isExecuting || !hasPrevious}
            onClick={previous}
            hideLabel
            label="Previous (Left)"
            icon={<MaterialSymbol icon="step_over" className="-scale-x-100" />}
          />
          <Button
            variant="primary"
            hideLabel
            onClick={() => {
              if (isPlaying) {
                stop();
              } else {
                if (!hasNext) {
                  restartAndPlay();
                } else {
                  play();
                }
              }
            }}
            disabled={isExecuting && !isPlaying}
            label={`${
              isPlaying ? 'Pause' : hasNext ? 'Play' : 'Restart'
            } (Space)`}
            icon={
              isPlaying ? (
                <MaterialSymbol icon="pause" />
              ) : hasNext ? (
                <MaterialSymbol icon="play_arrow" />
              ) : (
                <MaterialSymbol icon="restart_alt" />
              )
            }
          />
          <AsyncButton
            disabled={isPlaying || isExecuting || !hasNext}
            hideLabel
            onClick={next}
            label="Next (Right)"
            icon={<MaterialSymbol icon="step_over" />}
          />
          <AsyncButton
            label="Skip to end (Shift + right)"
            disabled={isPlaying || isExecuting || !hasNext}
            hideLabel
            onClick={skipToEnd}
            icon={<MaterialSymbol icon="last_page" />}
          />
        </div>
        <Popover
          content={
            <div className="flex flex-col p-4 gap-2">
              <Heading variant="h4">Settings</Heading>
              <HeadingContent>
                <RadioButtons
                  label="Playback speed"
                  value={playbackSpeed.toString()}
                  disabled={isPlaying}
                  onChange={(speed) => {
                    setPlaybackSpeed(parseFloat(speed) as PlaybackSpeed);
                  }}
                  options={[0.25, 0.5, 1, 1.25, 1.5, 2].map((speed) => ({
                    label: `${speed}x`,
                    value: speed.toString(),
                  }))}
                />
                <Input
                  label="Max execution steps"
                  value={maxExecutionStepCount.toString()}
                  onChange={(e) => {
                    setMaxExecutionStepCount(parseInt(e.target.value, 10));
                  }}
                  type="number"
                />
              </HeadingContent>
            </div>
          }
        >
          <Button
            label="Settings"
            hideLabel
            icon={<MaterialSymbol icon="settings" />}
          />
        </Popover>
      </div>
    </div>
  );
}
