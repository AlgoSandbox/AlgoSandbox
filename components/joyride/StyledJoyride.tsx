import { Button } from '@components/ui';
import Heading from '@components/ui/Heading';
import { ComponentProps } from 'react';
import Joyride, { TooltipRenderProps } from 'react-joyride';

export type StyledJoyrideProps = Omit<
  ComponentProps<typeof Joyride>,
  'tooltipComponent' | 'styles' | 'callback' | 'run'
> & {
  onFinish?: () => void;
  show: boolean;
};

function JoyrideTooltip({
  continuous,
  index,
  step,
  skipProps: { title: skipTitle, ...skipProps },
  backProps: { title: backTitle, ...backProps },
  closeProps: { title: closeTitle, ...closeProps },
  primaryProps: { title: primaryTitle, ...primaryProps },
  tooltipProps,
}: TooltipRenderProps) {
  return (
    <div
      className="p-4 bg-surface border max-w-md shadow rounded flex flex-col gap-4"
      style={{
        maxWidth: 'min(28rem, 100vw - 2rem)',
      }}
      {...tooltipProps}
    >
      {step.title && <Heading variant="h4">{step.title}</Heading>}
      {step.content}
      <div className="flex justify-between">
        <div>
          {index > 0 && (
            <Button {...backProps} label={backTitle} variant="filled" />
          )}
        </div>
        <div className="flex gap-2">
          {continuous && <Button {...skipProps} label={skipTitle} />}
          {continuous && (
            <Button {...primaryProps} label={primaryTitle} variant="primary" />
          )}
          {!continuous && (
            <Button {...closeProps} label={closeTitle} variant="primary" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function StyledJoyride({
  onFinish,
  show,
  ...props
}: StyledJoyrideProps) {
  return (
    <Joyride
      {...props}
      locale={{
        last: 'Finish',
      }}
      showProgress
      showSkipButton
      tooltipComponent={JoyrideTooltip}
      run={show}
      callback={(props) => {
        const { type } = props;
        if (type === 'tour:end') {
          onFinish?.();
        }
      }}
      beaconComponent={(props) => (
        <div
          {...props}
          className="animate-ping rounded-full bg-accent w-12 h-12"
        />
      )}
      styles={{
        options: {
          arrowColor: 'rgb(var(--color-surface-high))',
          backgroundColor: 'rgb(var(--color-surface-high))',
          primaryColor: 'rgb(1, 16, 40)',
          textColor: 'rgb(var(--color-on-surface))',
        },
      }}
    />
  );
}
