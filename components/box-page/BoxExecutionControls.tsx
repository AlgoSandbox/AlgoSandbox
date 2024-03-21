import { Button, MaterialSymbol, Popover } from '@components/ui';
import Heading, { HeadingContent } from '@components/ui/Heading';
import RadioButtons from '@components/ui/RadioButtons';

import {
  PlaybackSpeed,
  useBoxControlsContext,
} from './BoxControlsContextProvider';

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
  } = useBoxControlsContext();

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono px-2 rounded-full bg-surface border">
        #{currentStepIndex + 1}/{maxSteps ?? '?'}
      </span>
      <div className="flex gap-2 items-center">
        <Button
          disabled={isPlaying || !hasPrevious}
          label="Skip to start (Shift + left)"
          hideLabel
          onClick={skipToStart}
          icon={<MaterialSymbol icon="first_page" />}
        />
        <Button
          disabled={isPlaying || !hasPrevious}
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
        <Button
          disabled={isPlaying || !hasNext}
          hideLabel
          onClick={next}
          label="Next (Right)"
          icon={<MaterialSymbol icon="step_over" />}
        />
        <Button
          label="Skip to end (Shift + right)"
          disabled={isPlaying || !hasNext}
          hideLabel
          onClick={skipToEnd}
          icon={<MaterialSymbol icon="last_page" />}
        />
        <Popover
          content={
            <div className="flex flex-col bg-surface p-4">
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
