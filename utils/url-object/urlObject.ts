import { componentTag } from '@algo-sandbox/core';
import {
  DbSandboxObject,
  DbSandboxObjectSaved,
  sandboxObjectType,
} from '@utils/db';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import { useSearchParams } from 'next/navigation';

export function exportObjectToRelativeUrl(object: DbSandboxObject) {
  const { name, type, files } = object;
  const searchParams = new URLSearchParams();
  searchParams.set('name', name);
  searchParams.set(
    'files',
    compressToEncodedURIComponent(JSON.stringify(files)),
  );
  searchParams.set('type', type);
  searchParams.set('tags', object.tags.map((tag) => tag).join(','));
  return `/import?${searchParams.toString()}`;
}

export function useObjectFromUrl(): DbSandboxObject {
  const searchParams = useSearchParams();
  // TODO: Validate every argument
  const name = searchParams.get('name') ?? '';
  const files = (() => {
    const filesString = searchParams.get('files');
    if (filesString === null) {
      return {};
    }

    try {
      return JSON.parse(decompressFromEncodedURIComponent(filesString));
    } catch {
      return {};
    }
  })();
  const type = sandboxObjectType.parse(searchParams.get('type'));
  const tags =
    searchParams
      .get('tags')
      ?.split(',')
      .map((tag) => componentTag.parse(tag)) ?? [];
  return { name, type, files, editable: true, tags };
}

export function getSavedComponentRelativeUrl(object: DbSandboxObjectSaved) {
  return `/component?key=${object.key}`;
}
