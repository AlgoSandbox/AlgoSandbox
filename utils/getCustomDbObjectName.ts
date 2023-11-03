import { DbSandboxObject } from './db';

export default function getCustomDbObjectName(dbObject: DbSandboxObject) {
  return `${dbObject.name} (Custom)`;
}
