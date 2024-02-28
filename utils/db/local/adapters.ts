import { DbAdapter, DbAdapterSaved } from '..';
import { deleteSandboxObject, saveSandboxObject } from '.';

const savedListKey = 'sandbox:adapters:custom';

function getSavedAdapterKeys() {
  const savedAdapterKeysRaw = localStorage.getItem(savedListKey);

  if (savedAdapterKeysRaw === null) {
    return [];
  }

  return JSON.parse(savedAdapterKeysRaw) as Array<string>;
}

export function getSavedAdapters() {
  const savedAdapterKeys = getSavedAdapterKeys();

  return savedAdapterKeys
    .map((key) => localStorage.getItem(key))
    .filter((item) => item !== null)
    .map((item) => JSON.parse(item!)) as Array<DbAdapterSaved>;
}

export function addSavedAdapter(adapter: DbAdapter) {
  return saveSandboxObject(adapter);
}

export function setSavedAdapter(adapter: DbAdapterSaved) {
  return saveSandboxObject(adapter);
}

export function removeSavedAdapter(adapter: DbAdapterSaved) {
  return deleteSandboxObject(adapter);
}
