'use client';

import { useObjectFromUrl } from '@utils/url-object/urlObject';
import { Suspense } from 'react';

import ImportPage from './ImportPage';

function PageImpl() {
  const component = useObjectFromUrl();

  return <ImportPage component={component} />;
}

export default function Page() {
  return (
    <Suspense>
      <PageImpl />
    </Suspense>
  );
}
