'use client';

import { useObjectFromUrl } from '@utils/url-object/urlObject';

import ImportPage from './ImportPage';

export default function Page() {
  const component = useObjectFromUrl();

  return <ImportPage component={component} />;
}
