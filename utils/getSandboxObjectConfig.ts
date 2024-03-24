import { ComponentConfig } from '@algo-sandbox/core';

import { DbSandboxObject } from './db';
import parseSandboxObjectConfig from './parseSandboxComponentConfig';

const defaultConfig: ComponentConfig = {
  tags: [],
};
Object.freeze(defaultConfig);

export default function getSandboxObjectConfig(
  object: DbSandboxObject,
): ComponentConfig {
  const configContents = object.files['config.ts'];

  if (configContents === undefined) {
    return defaultConfig;
  }

  return parseSandboxObjectConfig(configContents);
}
