import { DbAdapter, DbAdapterSaved } from '..';
import { saveSandboxObject } from '.';

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
  const savedAdapter = saveSandboxObject(adapter);
  const adapterKeys = getSavedAdapterKeys();
  const newAdapterKeys = [...adapterKeys, savedAdapter.key];
  localStorage.setItem(savedListKey, JSON.stringify(newAdapterKeys));

  return savedAdapter;
}

export function setSavedAdapter(adapter: DbAdapterSaved) {
  const savedAdapter = saveSandboxObject(adapter);

  return savedAdapter;
}

export function removeSavedAdapter(adapter: DbAdapterSaved) {
  localStorage.removeItem(adapter.key);

  const adapterKeys = getSavedAdapterKeys();
  const newAdapterKeys = adapterKeys.filter((key) => key !== adapter.key);
  localStorage.setItem(savedListKey, JSON.stringify(newAdapterKeys));
}
