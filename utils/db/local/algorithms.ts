import { SandboxAnyAlgorithm } from '@types';
import { DbSandboxObject, DbSavedSandboxObject } from '../types';
import { saveSandboxObject } from '.';

export namespace LocalDb {
  export function getSavedAlgorithmKeys() {
    const savedAlgorithmKeysRaw = localStorage.getItem(
      'sandbox:algorithms:custom'
    );

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
      .map((item) => JSON.parse(item!)) as Array<DbSavedSandboxObject>;
  }

  export function addSavedAlgorithm(algorithm: DbSandboxObject) {
    const savedAlgorithm = saveSandboxObject('algorithm', algorithm);
    const algorithmKeys = getSavedAlgorithmKeys();
    const newAlgorithmKeys = [...algorithmKeys, savedAlgorithm.key];
    localStorage.setItem(
      'sandbox:algorithms:custom',
      JSON.stringify(newAlgorithmKeys)
    );

    return savedAlgorithm;
  }

  export function setSavedAlgorithm(algorithm: DbSavedSandboxObject) {
    const savedAlgorithm = saveSandboxObject('algorithm', algorithm);

    return savedAlgorithm;
  }

  export function removeSavedAlgorithm(algorithm: DbSavedSandboxObject) {
    localStorage.removeItem(algorithm.key);

    const algorithmKeys = getSavedAlgorithmKeys();
    const newAlgorithmKeys = algorithmKeys.filter(
      (key) => key !== algorithm.key
    );
    localStorage.setItem(
      'sandbox:algorithms:custom',
      JSON.stringify(newAlgorithmKeys)
    );
  }
}
