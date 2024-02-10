'use client';

import { useSearchParams } from 'next/navigation';

import ComponentPage from './ComponentPage';

export default function Page() {
  const componentKey = useSearchParams().get('key') ?? '';

  return <ComponentPage componentKey={componentKey} />;
}
