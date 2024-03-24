import { Button, MaterialSymbol, Tooltip } from '@components/ui';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import AppLogo from './AppLogo';
import DrawerItem from './DrawerItem';
import { Drawer, DrawerContent, DrawerTrigger } from './ui/Drawer';

export default function AppNavBar({
  children,
  drawerContents,
}: {
  children: React.ReactNode;
  drawerContents?: React.ReactNode;
}) {
  const router = useRouter();

  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <div className="flex items-center sticky border-b top-0 bg-canvas z-10 h-14 gap-2">
      <Drawer
        open={showDrawer}
        onOpenChange={(open) => {
          setShowDrawer(open);
        }}
      >
        <DrawerTrigger asChild>
          <Button
            className="lg:hidden ms-2"
            label="Menu"
            hideLabel
            icon={<MaterialSymbol icon="menu" />}
          />
        </DrawerTrigger>
        <DrawerContent
          onClick={() => {
            setShowDrawer(false);
          }}
        >
          <DrawerItem
            label="Back to home"
            icon="arrow_back"
            onClick={() => {
              router.push('/');
            }}
          />
          {drawerContents}
        </DrawerContent>
      </Drawer>
      <Tooltip content="Back to home">
        <a
          className={clsx(
            'group hidden lg:flex items-center w-14 self-stretch justify-center',
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
