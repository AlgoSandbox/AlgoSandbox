import { MaterialSymbol, Tooltip } from '@components/ui';
import clsx from 'clsx';

import AppLogo from './AppLogo';

export default function AppNavBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex sticky border-b top-0 bg-canvas z-10 h-14 gap-2">
      <Tooltip content="Back to home">
        <a
          className={clsx(
            'group flex items-center w-14 self-stretch justify-center',
            'hover:bg-surface-high',
            'focus-visible:bg-surface-high',
          )}
          href="/"
        >
          <MaterialSymbol
            className={clsx(
              'w-0 transition-all opacity-0 text-accent',
              'group-hover:w-6 group-hover:opacity-100',
              'group-focus-visible:w-6 group-focus-visible:opacity-100',
            )}
            icon="chevron_left"
          />
          <AppLogo className="w-6 h-6" />
        </a>
      </Tooltip>
      {children}
    </div>
  );
}
