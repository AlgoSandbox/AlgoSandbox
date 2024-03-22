import clsx from 'clsx';
import { DetailedHTMLProps, forwardRef, LabelHTMLAttributes } from 'react';

export type FormLabelProps = DetailedHTMLProps<
  LabelHTMLAttributes<HTMLLabelElement>,
  HTMLLabelElement
> & {
  children: React.ReactNode;
  disabled?: boolean;
};

const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ children, className, disabled, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={clsx(
          'text-sm font-medium',
          disabled ? 'text-muted' : 'text-label',
          className,
        )}
        {...props}
      >
        {children}
      </label>
    );
  },
);

FormLabel.displayName = 'FormLabel';

export default FormLabel;
