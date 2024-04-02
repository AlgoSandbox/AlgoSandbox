import {
  SandboxComponent,
  SandboxKey,
  SandboxObjectType,
} from '@algo-sandbox/components/SandboxKey';
import { error, ErrorOr } from '@app/errors';
import { SandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { CatalogOption } from '@constants/catalog';
import evalSavedObjectImpl from '@utils/eval/evalSavedObjectImpl';
import { EvalWithAlgoSandbox } from '@algo-sandbox/utils/evalWithAlgoSandboxServerSide';

import { DbSandboxObjectSaved } from './db';

export default function getSandboxObjectWithKeyImpl<
  T extends SandboxObjectType,
>({
  type,
  key,
  sandboxComponents,
  files,
  evalFn,
}: {
  type: T;
  key: SandboxKey<T>;
  files: Record<string, string>;
  sandboxComponents: SandboxComponents;
  evalFn: EvalWithAlgoSandbox;
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

    return evalFn(files['index.ts']) as ErrorOr<SandboxComponent<T>>;
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
  })() as Array<CatalogOption<DbSandboxObjectSaved<T>>>;

  const savedObject =
    options.find((option) => option.key === key)?.value ?? null;

  if (savedObject === null) {
    return error(`Evaluation error: No saved object found for key ${key}`);
  }

  return evalSavedObjectImpl<T>(savedObject, evalFn) as ErrorOr<
    SandboxComponent<T>
  >;
}
