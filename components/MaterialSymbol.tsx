import clsx from 'clsx';
import { forwardRef } from 'react';

export type MaterialSymbolProps = {
  icon: string;
  className?: string;
};

const MaterialSymbol = forwardRef<HTMLSpanElement, MaterialSymbolProps>(
  ({ icon, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx('material-symbols-rounded select-none', className)}
        {...props}
      >
        {icon}
      </span>
    );
  }
);

MaterialSymbol.displayName = 'MaterialSymbol';

export default MaterialSymbol;
