import { DbSandboxObject, DbSandboxObjectSaved } from '../types';
import { saveSandboxObject } from '.';

const savedListKey = 'sandbox:algorithms:custom';

function getSavedAlgorithmKeys() {
  const savedAlgorithmKeysRaw = localStorage.getItem(savedListKey);

  if (savedAlgorithmKeysRaw === null) {
    return [];
  }

  return JSON.parse(savedAlgorithmKeysRaw) as Array<string>;
}

export function getSavedAlgorithms() {
  const savedAlgorithmKeys = getSavedAlgorithmKeys();

  return savedAlgorithmKeys
    .map((key) => localStorage.getItem(key))
    .filter((item) => item !== null)
    .map((item) => JSON.parse(item!)) as Array<DbSandboxObjectSaved>;
}

export function addSavedAlgorithm(algorithm: DbSandboxObject) {
  const savedAlgorithm = saveSandboxObject('algorithm', algorithm);
  const algorithmKeys = getSavedAlgorithmKeys();
  const newAlgorithmKeys = [...algorithmKeys, savedAlgorithm.key];
  localStorage.setItem(savedListKey, JSON.stringify(newAlgorithmKeys));

  return savedAlgorithm;
}

export function setSavedAlgorithm(algorithm: DbSandboxObjectSaved) {
  const savedAlgorithm = saveSandboxObject('algorithm', algorithm);

  return savedAlgorithm;
}

export function removeSavedAlgorithm(algorithm: DbSandboxObjectSaved) {
  localStorage.removeItem(algorithm.key);

  const algorithmKeys = getSavedAlgorithmKeys();
  const newAlgorithmKeys = algorithmKeys.filter((key) => key !== algorithm.key);
  localStorage.setItem(savedListKey, JSON.stringify(newAlgorithmKeys));
}
