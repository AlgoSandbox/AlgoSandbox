import { MaterialSymbol, Tooltip } from '@components/ui';

import AppLogo from './AppLogo';

export default function AppNavBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex sticky border-b top-0 bg-canvas z-10 h-14 gap-2">
      <Tooltip content="Back to home">
        <a
          className="group hover:bg-surface-high flex items-center w-14 self-stretch justify-center"
          href="/"
        >
          <MaterialSymbol
            className="w-0 group-hover:w-6 transition-all opacity-0 group-hover:opacity-100 text-accent"
            icon="chevron_left"
          />
          <AppLogo className="w-6 h-6" />
        </a>
      </Tooltip>
      {children}
    </div>
  );
}
