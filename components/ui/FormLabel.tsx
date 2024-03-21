import clsx from 'clsx';
import { DetailedHTMLProps, forwardRef, LabelHTMLAttributes } from 'react';

export type FormLabelProps = DetailedHTMLProps<
  LabelHTMLAttributes<HTMLLabelElement>,
  HTMLLabelElement
> & {
  children: React.ReactNode;
};

const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={clsx('text-sm font-medium text-label', className)}
        {...props}
      >
        {children}
      </label>
    );
  },
);

FormLabel.displayName = 'FormLabel';

export default FormLabel;
