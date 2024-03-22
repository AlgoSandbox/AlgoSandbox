'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
const PlaygroundLayout = dynamic(() => import('./PlaygroundLayout'), {
  ssr: false,
});

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <PlaygroundLayout>{children}</PlaygroundLayout>
    </Suspense>
  );
}
