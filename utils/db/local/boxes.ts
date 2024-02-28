import { DbBox, DbBoxSaved } from '..';
import { deleteSandboxObject, saveSandboxObject } from '.';

const savedListKey = 'sandbox:boxes:custom';

function getSavedBoxKeys() {
  const savedboxKeysRaw = localStorage.getItem(savedListKey);

  if (savedboxKeysRaw === null) {
    return [];
  }

  return JSON.parse(savedboxKeysRaw) as Array<string>;
}

export function getSavedBoxes() {
  const savedBoxKeys = getSavedBoxKeys();

  return savedBoxKeys
    .map((key) => localStorage.getItem(key))
    .filter((item) => item !== null)
    .map((item) => JSON.parse(item!)) as Array<DbBoxSaved>;
}

export function addSavedBox(box: DbBox) {
  return saveSandboxObject(box);
}

export function setSavedBox(box: DbBoxSaved) {
  return saveSandboxObject(box);
}

export function removeSavedBox(box: DbBoxSaved) {
  return deleteSandboxObject(box);
}
