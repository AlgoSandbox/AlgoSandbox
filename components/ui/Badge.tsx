import clsx from 'clsx';
import { cloneElement, ForwardedRef, forwardRef,ReactElement } from 'react';

export type BadgeProps = {
  content: string | number;
  children: ReactElement;
  visible?: boolean;
};

function Badge(
  { content, children, visible, ...props }: BadgeProps,
  ref: ForwardedRef<HTMLElement>
) {
  return (
    <div className="relative">
      <div
        className={clsx(
          !visible && 'hidden',
          'absolute -top-2 -end-2 py-0.5 px-2 bg-primary-500 text-white text-xs rounded-full'
        )}
      >
        <span>{content}</span>
      </div>
      {cloneElement(children, { ...props, ref })}
    </div>
  );
}

export default forwardRef(Badge);
