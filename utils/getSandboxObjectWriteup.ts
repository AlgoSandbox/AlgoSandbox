import { DbSandboxObject } from './db';

export default function getSandboxObjectWriteup(object: DbSandboxObject) {
  return object.files['index.md'] as string | undefined;
}
