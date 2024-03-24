import { ComponentConfig } from '@algo-sandbox/core';

import evalServerSide from './eval/evalServerSide';

const defaultConfig: ComponentConfig = {
  tags: [],
};
Object.freeze(defaultConfig);

export default function parseSandboxObjectConfig(
  configContents: string | undefined,
): ComponentConfig {
  if (configContents === undefined) {
    return defaultConfig;
  }

  const config =
    evalServerSide<ComponentConfig>(configContents).unwrapOr(defaultConfig);

  return config;
}
