import {
  SandboxComponent,
  SandboxKey,
  SandboxObjectType,
} from '@algo-sandbox/components/SandboxKey';
import { error, ErrorOr } from '@app/errors/ErrorContext';
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
}): ErrorOr<SandboxComponent<T>> {
  const {
    builtInAdapterOptions,
    builtInAlgorithmOptions,
    builtInProblemOptions,
    builtInVisualizerOptions,
  } = builtInComponents;

  if (key === '.') {
    if (!('index.ts' in files)) {
      return error('No index.ts file found for component which uses "." key');
    }
    return evalWithAlgoSandbox(files['index.ts']) as ErrorOr<
      SandboxComponent<T>
    >;
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

  if (savedObject === null) {
    return error(`Evaluation error: No saved object found for key ${key}`);
  }

  return evalSavedObject<T>(savedObject) as ErrorOr<SandboxComponent<T>>;
}
