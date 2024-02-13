import {
  DbSandboxObject,
  DbSandboxObjectSaved,
  sandboxObjectType,
} from '@utils/db';
import { useSearchParams } from 'next/navigation';

export function exportObjectToRelativeUrl(object: DbSandboxObject) {
  const { name, type, files } = object;
  const searchParams = new URLSearchParams();
  searchParams.set('name', name);
  searchParams.set(
    'files',
    // TODO: Compress files to smaller format
    Buffer.from(JSON.stringify(files)).toString('base64'),
  );
  searchParams.set('type', type);
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
      return JSON.parse(Buffer.from(filesString, 'base64').toString('utf-8'));
    } catch {
      return {};
    }
  })();
  const type = sandboxObjectType.parse(searchParams.get('type'));
  return { name, type, files, editable: true };
}

export function getSavedComponentRelativeUrl(object: DbSandboxObjectSaved) {
  return `/component?key=${object.key}`;
}
