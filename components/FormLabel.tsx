import clsx from 'clsx';
import { DetailedHTMLProps, HTMLAttributes, forwardRef } from 'react';

export type FormLabelProps = DetailedHTMLProps<
  HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
> & {
  children: React.ReactNode;
};

const FormLabel = forwardRef<HTMLSpanElement, FormLabelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx('text-sm font-medium text-neutral-600', className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

export default FormLabel;
