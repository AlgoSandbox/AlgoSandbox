import {
  SandboxComponent,
  SandboxKey,
  SandboxObjectType,
} from '@algo-sandbox/components/SandboxKey';
import { DbObjectSaved } from '@components/box-page/box-context/sandbox-object';
import { BuiltInComponents } from '@components/playground/BuiltInComponentsProvider';
import { CatalogGroup } from '@constants/catalog';

import { evalSavedObject } from './evalSavedObject';
import evalWithAlgoSandbox from './evalWithAlgoSandbox';

export default function getSandboxObjectWithKey<T extends SandboxObjectType>({
  type,
  key,
  builtInComponents,
  files,
}: {
  type: T;
  key: SandboxKey<T>;
  files: Record<string, string>;
  builtInComponents: BuiltInComponents;
}): SandboxComponent<T> | null {
  const {
    builtInAdapterOptions,
    builtInAlgorithmOptions,
    builtInProblemOptions,
    builtInVisualizerOptions,
  } = builtInComponents;

  if (key === '.') {
    if (!('index.ts' in files)) {
      throw new Error(
        'No index.ts file found for component which uses "." key',
      );
    }
    return evalWithAlgoSandbox(files['index.ts']) as SandboxComponent<T>;
  }

  const builtInOptions = (() => {
    switch (type) {
      case 'algorithm':
        return builtInAlgorithmOptions;
      case 'problem':
        return builtInProblemOptions;
      case 'visualizer':
        return builtInVisualizerOptions;
      case 'adapter':
        return builtInAdapterOptions;
    }
  })() as CatalogGroup<DbObjectSaved<T>>[];

  const savedObject =
    builtInOptions
      .flatMap((group) => group.options)
      .find((option) => option.key === key)?.value ?? null;

  const { objectEvaled } = evalSavedObject<T>(savedObject);

  return objectEvaled as SandboxComponent<T>;
}
