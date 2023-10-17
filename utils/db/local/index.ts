import { DbSandboxObject } from '../types';

type SandboxObjectType = 'algorithm';

function createKey(type: SandboxObjectType, object: DbSandboxObject) {
  switch (type) {
    case 'algorithm':
      const key = `sandbox:algorithms:${object.name}-${new Date().getTime()}`;
      return key;
  }
}

export function saveSandboxObject(
  type: SandboxObjectType,
  object: DbSandboxObject
) {
  const key = object.key ?? createKey(type, object);
  const saved = {
    ...object,
    key,
  };

  localStorage.setItem(key, JSON.stringify(saved));

  return saved;
}
