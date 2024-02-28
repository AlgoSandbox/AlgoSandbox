/* eslint-disable @typescript-eslint/no-explicit-any */
import { SandboxKey } from '@algo-sandbox/components/SandboxKey';
import {
  getDefaultParameters,
  Parameterized,
  ParsedParameters,
  SandboxAdapter,
  SandboxAlgorithm,
  SandboxBox,
  SandboxParameters,
  SandboxProblem,
  SandboxStateType,
  SandboxVisualizer,
} from '@algo-sandbox/core';
import { ErrorEntry, ErrorOr, success } from '@app/errors/ErrorContext';
import {
  CatalogGroup,
  CatalogOption,
  CatalogOptions,
} from '@constants/catalog';
import { fromTry } from '@sweet-monads/either';
import { UseMutationResult } from '@tanstack/react-query';
import {
  SandboxAnyAdapter,
  SandboxAnyAlgorithm,
  SandboxAnyProblem,
  SandboxAnyVisualizer,
} from '@typings/algo-sandbox';
import {
  DbAdapter,
  DbAdapterSaved,
  DbAlgorithm,
  DbAlgorithmSaved,
  DbBox,
  DbBoxSaved,
  DbProblem,
  DbProblemSaved,
  DbVisualizer,
  DbVisualizerSaved,
} from '@utils/db';
import { evalSavedObject } from '@utils/evalSavedObject';
import {
  sandboxAdapter,
  sandboxParameterizedAdapter,
} from '@utils/verifiers/adapter';
import {
  sandboxAlgorithm,
  sandboxParameterizedAlgorithm,
} from '@utils/verifiers/algorithm';
import { sandboxBox } from '@utils/verifiers/box';
import {
  sandboxParameterizedProblem,
  sandboxProblem,
} from '@utils/verifiers/problem';
import {
  sandboxParameterizedVisualizer,
  sandboxVisualizer,
} from '@utils/verifiers/visualizer';
import { useEffect, useMemo } from 'react';

type SandboxObjectTypeMap = {
  adapter: {
    instance: SandboxAdapter<SandboxStateType, SandboxStateType>;
    value: SandboxAnyAdapter;
    dbObject: DbAdapter;
    dbObjectSaved: DbAdapterSaved;
  };
  algorithm: {
    instance: SandboxAlgorithm<SandboxStateType, SandboxStateType>;
    value: SandboxAnyAlgorithm;
    dbObject: DbAlgorithm;
    dbObjectSaved: DbAlgorithmSaved;
  };
  problem: {
    instance: SandboxProblem<SandboxStateType>;
    value: SandboxAnyProblem;
    dbObject: DbProblem;
    dbObjectSaved: DbProblemSaved;
  };
  visualizer: {
    instance: SandboxVisualizer<SandboxStateType, unknown>;
    value: SandboxAnyVisualizer;
    dbObject: DbVisualizer;
    dbObjectSaved: DbVisualizerSaved;
  };
  box: {
    instance: SandboxBox;
    value: SandboxBox;
    dbObject: DbBox;
    dbObjectSaved: DbBoxSaved;
  };
};

const verifiers = {
  adapter: {
    instance: sandboxAdapter,
    parameterized: sandboxParameterizedAdapter,
  },
  algorithm: {
    instance: sandboxAlgorithm,
    parameterized: sandboxParameterizedAlgorithm,
  },
  problem: {
    instance: sandboxProblem,
    parameterized: sandboxParameterizedProblem,
  },
  visualizer: {
    instance: sandboxVisualizer,
    parameterized: sandboxParameterizedVisualizer,
  },
  box: {
    instance: sandboxBox,
    parameterized: sandboxBox,
  },
};

type Instance<T extends keyof SandboxObjectTypeMap> =
  SandboxObjectTypeMap[T]['instance'];
export type Value<T extends keyof SandboxObjectTypeMap> =
  SandboxObjectTypeMap[T]['value'];
export type DbObject<T extends keyof SandboxObjectTypeMap> =
  SandboxObjectTypeMap[T]['dbObject'];
export type DbObjectSaved<T extends keyof SandboxObjectTypeMap> =
  SandboxObjectTypeMap[T]['dbObjectSaved'];

function isParameterized<T extends keyof SandboxObjectTypeMap>(
  object: Parameterized<Instance<T>, SandboxParameters> | Instance<T>,
): object is Parameterized<Instance<T>, SandboxParameters> {
  return 'parameters' in object;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defaultBoxContextSandboxObject: BoxContextSandboxObject<any> = {
  instance: success(null),
  value: success(null),
  parameters: {
    default: {},
    value: {},
    setValue: () => {},
  },
  select: {
    value: null,
    setValue: () => {},
    options: [],
  },
};

export type BoxContextSandboxObject<T extends keyof SandboxObjectTypeMap> = {
  instance: ErrorOr<Instance<T> | null>;
  value: ErrorOr<Value<T> | null>;
  parameters: {
    default: ParsedParameters<SandboxParameters> | null;
    value: ParsedParameters<SandboxParameters> | null;
    setValue: (value: ParsedParameters<SandboxParameters>) => void;
  };
  select: {
    value: CatalogOption<DbObjectSaved<T>> | null;
    setValue: (value: CatalogOption<DbObjectSaved<T>>) => void;
    options: CatalogOptions<DbObjectSaved<T>>;
  };
};

export function useBoxContextSandboxObject<
  T extends keyof SandboxObjectTypeMap,
>({
  options,
  type,
  key: selectedOptionKey,
  onKeyChange,
  parameters,
  onParametersChange,
}: {
  type: T;
  key: SandboxKey<T> | null;
  parameters: Record<string, unknown> | null;
  onParametersChange: (parameters: Record<string, unknown>) => void;
  options: Array<CatalogGroup<DbObjectSaved<T>>>;
  addSavedObjectMutation: UseMutationResult<DbObject<T>, unknown, DbObject<T>>;
  setSavedObjectMutation: UseMutationResult<
    DbObject<T>,
    unknown,
    DbObjectSaved<T>
  >;
  removeSavedObjectMutation: UseMutationResult<void, unknown, DbObjectSaved<T>>;
  savedObjects: Array<DbObjectSaved<T>> | undefined;
  onKeyChange: (key: SandboxKey<T>) => void;
}) {
  const selectedOptionObject = useMemo(() => {
    if (selectedOptionKey === null) {
      return null;
    }

    const flattenedOptions = options.flatMap((group) => group.options);
    return (
      flattenedOptions.find((option) => option.key === selectedOptionKey) ??
      null
    );
  }, [options, selectedOptionKey]);

  useEffect(() => {
    if (selectedOptionKey !== null) {
      return;
    }
    const option = options.at(0)?.options.at(0);
    if (option === undefined) {
      return;
    }

    onKeyChange(option.key as SandboxKey<T>);
  }, [onKeyChange, options, selectedOptionKey]);

  const evaluation = useMemo(() => {
    if (selectedOptionObject === null) {
      return success(null);
    }

    const object = selectedOptionObject.value;

    return evalSavedObject(object);
  }, [selectedOptionObject]);

  const objectInstancerEvaluation: ErrorOr<Parameterized<
    Instance<T>,
    Record<string, any>
  > | null> = useMemo(() => {
    return evaluation.chain((objectEvaled) => {
      return fromTry(() => {
        try {
          if (objectEvaled === null) {
            return null;
          }

          if (isParameterized(objectEvaled)) {
            verifiers[type].parameterized.parse(objectEvaled);
            return objectEvaled as Parameterized<
              Instance<T>,
              Record<string, any>
            >;
          }

          // Verify objectEvaled has necessary fields
          verifiers[type].instance.parse(objectEvaled);

          return {
            // TODO: Read name from README
            name: 'name' in objectEvaled ? objectEvaled.name : 'Untitled',
            parameters: {},
            create: () => {
              return objectEvaled as Instance<T>;
            },
          } satisfies Parameterized<Instance<T>, Record<string, any>>;
        } catch (e) {
          throw `Error in component definition:\n\n${e}`;
        }
      });
    });
  }, [evaluation, type]);

  const defaultParameters = useMemo(() => {
    return objectInstancerEvaluation
      .map((objectInstancer) => {
        if (objectInstancer === null) {
          return null;
        }
        return getDefaultParameters(
          objectInstancer.parameters,
        ) as ParsedParameters<SandboxParameters>;
      })
      .mapLeft(() => null).value;
  }, [objectInstancerEvaluation]);

  const objectInstance: ErrorOr<Instance<T> | null> = useMemo(() => {
    return objectInstancerEvaluation.chain((objectInstancer) => {
      return fromTry(() => {
        try {
          if (objectInstancer === null) {
            return null;
          }

          const params = parameters ?? defaultParameters ?? {};

          if (
            Object.keys(objectInstancer.parameters).every((k) => k in params)
          ) {
            return objectInstancer.create(params);
          }
          return null;
        } catch (e) {
          throw [
            {
              message: `Failed to create with parameters:\n\n${e}`,
            },
          ] satisfies Array<ErrorEntry>;
        }
      });
    });
  }, [defaultParameters, objectInstancerEvaluation, parameters]);

  const object = useMemo(() => {
    return {
      instance: objectInstance,
      value: evaluation,
      parameters: {
        default: defaultParameters,
        value: parameters,
        setValue: onParametersChange,
      },
      select: {
        value: selectedOptionObject,
        setValue: (option) => {
          onKeyChange(option.key as SandboxKey<T>);
        },
        options: options,
      },
    } satisfies BoxContextSandboxObject<T>;
  }, [
    objectInstance,
    evaluation,
    defaultParameters,
    parameters,
    onParametersChange,
    selectedOptionObject,
    options,
    onKeyChange,
  ]);

  return object;
}
