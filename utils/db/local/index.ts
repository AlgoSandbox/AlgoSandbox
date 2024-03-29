import { z } from 'zod';

import {
  DbSandboxObject,
  DbSandboxObjectSaved,
  DbSandboxObjectType,
} from '../types';

function getSavedObjectKeys(listKey: string) {
  return z
    .array(z.string())
    .catch([])
    .parse(JSON.parse(localStorage.getItem(listKey) ?? '[]'));
}

function createKey(object: DbSandboxObject): string {
  switch (object.type) {
    case 'adapter':
      return `sandbox:adapters:${object.name}-${new Date().getTime()}`;
    case 'algorithm':
      return `sandbox:algorithms:${object.name}-${new Date().getTime()}`;
    case 'problem':
      return `sandbox:problems:${object.name}-${new Date().getTime()}`;
    case 'visualizer':
      return `sandbox:visualizers:${object.name}-${new Date().getTime()}`;
    case 'box':
      return `sandbox:boxes:${object.name}-${new Date().getTime()}`;
  }
}

function getListKey(object: DbSandboxObject): string {
  switch (object.type) {
    case 'adapter':
      return 'sandbox:adapters:custom';
    case 'algorithm':
      return 'sandbox:algorithms:custom';
    case 'problem':
      return 'sandbox:problems:custom';
    case 'visualizer':
      return 'sandbox:visualizers:custom';
    case 'box':
      return 'sandbox:boxes:custom';
  }
}

export function saveSandboxObject<
  T extends DbSandboxObjectType = DbSandboxObjectType,
>(object: DbSandboxObject<T>) {
  const key = object.key ?? createKey(object);
  const savedObject = {
    ...object,
    key,
  };

  localStorage.setItem(key, JSON.stringify(savedObject));

  const savedObjectsKey = getListKey(object);
  const objectKeys = getSavedObjectKeys(savedObjectsKey);
  if (!objectKeys.includes(savedObject.key)) {
    const newObjectKeys = [...objectKeys, savedObject.key];
    localStorage.setItem(savedObjectsKey, JSON.stringify(newObjectKeys));
  }

  return savedObject;
}

export function getSandboxObject<
  T extends DbSandboxObjectType = DbSandboxObjectType,
>(key: string) {
  const saved = localStorage.getItem(key);

  if (saved === null) {
    return null;
  }

  return JSON.parse(saved) as DbSandboxObjectSaved<T>;
}

export function deleteSandboxObject<
  T extends DbSandboxObjectType = DbSandboxObjectType,
>(object: DbSandboxObjectSaved<T>) {
  const savedObjectsKey = getListKey(object);
  const objectKeys = getSavedObjectKeys(savedObjectsKey);
  const newObjectKeys = objectKeys.filter((k) => k !== object.key);
  localStorage.setItem(savedObjectsKey, JSON.stringify(newObjectKeys));

  localStorage.removeItem(object.key);
}
