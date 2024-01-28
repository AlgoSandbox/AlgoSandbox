import { DbBox, DbBoxSaved } from '..';
import { saveSandboxObject } from '.';

const savedListKey = 'sandbox:boxes:custom';

function getSavedBoxKeys() {
  const savedboxKeysRaw = localStorage.getItem(savedListKey);

  if (savedboxKeysRaw === null) {
    return [];
  }

  return JSON.parse(savedboxKeysRaw) as Array<string>;
}

export function getSavedBoxes() {
  const savedboxKeys = getSavedBoxKeys();

  return savedboxKeys
    .map((key) => localStorage.getItem(key))
    .filter((item) => item !== null)
    .map((item) => JSON.parse(item!)) as Array<DbBoxSaved>;
}

export function addSavedBox(box: DbBox) {
  const savedBox = saveSandboxObject(box);
  const boxKeys = getSavedBoxKeys();
  const newBoxKeys = [...boxKeys, savedBox.key];
  localStorage.setItem(savedListKey, JSON.stringify(newBoxKeys));

  return savedBox;
}

export function setSavedBox(box: DbBoxSaved) {
  const savedBox = saveSandboxObject(box);

  return savedBox;
}

export function removeSavedBox(box: DbBoxSaved) {
  localStorage.removeItem(box.key);

  const boxKeys = getSavedBoxKeys();
  const newBoxKeys = boxKeys.filter((key) => key !== box.key);
  localStorage.setItem(savedListKey, JSON.stringify(newBoxKeys));
}
