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
        <div>
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
      tooltipComponent={JoyrideTooltip}
      run={show}
      callback={(props) => {
        const { status, type } = props;
        if (
          (status === 'finished' && type === 'tour:end') ||
          status === 'skipped'
        ) {
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
