import {
  SandboxComponent,
  SandboxKey,
  SandboxObjectType,
} from '@algo-sandbox/components/SandboxKey';
import { error, ErrorOr } from '@app/errors/ErrorContext';
import { DbObjectSaved } from '@components/box-page/box-context/sandbox-object';
import { SandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { CatalogGroup } from '@constants/catalog';

import { evalSavedObject } from './evalSavedObject';
import evalWithAlgoSandbox from './evalWithAlgoSandbox';

export default function getSandboxObjectWithKey<T extends SandboxObjectType>({
  type,
  key,
  sandboxComponents,
  files,
}: {
  type: T;
  key: SandboxKey<T>;
  files: Record<string, string>;
  sandboxComponents: SandboxComponents;
}): ErrorOr<SandboxComponent<T>> {
  const {
    adapterOptions,
    algorithmOptions,
    problemOptions,
    visualizerOptions,
  } = sandboxComponents;

  if (key === '.') {
    if (!('index.ts' in files)) {
      return error('No index.ts file found for component which uses "." key');
    }
    return evalWithAlgoSandbox(files['index.ts']) as ErrorOr<
      SandboxComponent<T>
    >;
  }

  const options = (() => {
    switch (type) {
      case 'algorithm':
        return algorithmOptions;
      case 'problem':
        return problemOptions;
      case 'visualizer':
        return visualizerOptions;
      case 'adapter':
        return adapterOptions;
    }
  })() as CatalogGroup<DbObjectSaved<T>>[];

  const savedObject =
    options
      .flatMap((group) => group.options)
      .find((option) => option.key === key)?.value ?? null;

  if (savedObject === null) {
    return error(`Evaluation error: No saved object found for key ${key}`);
  }

  return evalSavedObject<T>(savedObject) as ErrorOr<SandboxComponent<T>>;
}
