'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import ComponentPage from './ComponentPage';

function PageImpl() {
  const componentKey = useSearchParams().get('key') ?? '';

  return <ComponentPage componentKey={componentKey} />;
}

export default function Page() {
  return (
    <Suspense>
      <PageImpl />
    </Suspense>
  );
}
