import { ComponentProps } from 'react';
import Joyride from 'react-joyride';

export type StyledJoyrideProps = Omit<
  ComponentProps<typeof Joyride>,
  'tooltipComponent' | 'styles'
>;

// function JoyrideTootip({
//   continuous,
//   index,
//   step,
//   backProps,
//   closeProps,
//   primaryProps,
//   tooltipProps,
// }: TooltipRenderProps) {
//   return (
//     <TooltipBody {...tooltipProps}>
//       {step.title && <TooltipTitle>{step.title}</TooltipTitle>}
//       <TooltipContent>{step.content}</TooltipContent>
//       <TooltipFooter>
//         {index > 0 && (
//           <Button {...backProps}>
//             <FormattedMessage id="back" />
//           </Button>
//         )}
//         {continuous && (
//           <Button {...primaryProps}>
//             <FormattedMessage id="next" />
//           </Button>
//         )}
//         {!continuous && (
//           <Button {...closeProps}>
//             <FormattedMessage id="close" />
//           </Button>
//         )}
//       </TooltipFooter>
//     </TooltipBody>
//   );
// }

export default function StyledJoyride(props: StyledJoyrideProps) {
  return (
    <Joyride
      {...props}
      // tooltipComponent={JoyrideTooltip}
      styles={{
        options: {
          arrowColor: 'rgb(var(--color-surface-high))',
          backgroundColor: 'rgb(var(--color-surface-high))',
          // beaconSize: 36,
          // overlayColor: 'rgba(0, 0, 0, 0.5)',
          primaryColor: 'black',
          // spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
          textColor: 'rgb(var(--color-on-surface))',
          // width: undefined,
          // zIndex: 100,
        },
      }}
    />
  );
}
