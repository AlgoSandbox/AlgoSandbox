import { ComponentConfig } from '@algo-sandbox/core';

export default function stringifyComponentConfigToTs(
  config: ComponentConfig,
): string {
  return `import { ComponentConfig } from '@algo-sandbox/core';

const config: ComponentConfig = {
  tags: [${config.tags.map((tag) => `\`${tag}\``).join(', ')}],
};

export default config;
`;
}
