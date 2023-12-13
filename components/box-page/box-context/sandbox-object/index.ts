import {
  getDefaultParameters,
  Parameterized,
  ParsedParameters,
  SandboxAlgorithm,
  SandboxParameters,
  SandboxProblem,
  SandboxStateType,
  SandboxVisualizer,
} from '@algo-sandbox/core';
import {
  CatalogGroup,
  CatalogOption,
  CatalogOptions,
} from '@constants/catalog';
import { UseMutationResult } from '@tanstack/react-query';
import {
  SandboxAnyAlgorithm,
  SandboxAnyProblem,
  SandboxAnyVisualizer,
} from '@typings/algo-sandbox';
import {
  DbAlgorithm,
  DbAlgorithmSaved,
  DbProblem,
  DbProblemSaved,
  DbVisualizer,
  DbVisualizerSaved,
} from '@utils/db';
import evalWithAlgoSandbox from '@utils/evalWithAlgoSandbox';
import tryEvaluate from '@utils/tryEvaluate';
import {
  sandboxAlgorithm,
  sandboxParameterizedAlgorithm,
} from '@utils/verifiers/algorithm';
import {
  sandboxParameterizedProblem,
  sandboxProblem,
} from '@utils/verifiers/problem';
import {
  sandboxParameterizedVisualizer,
  sandboxVisualizer,
} from '@utils/verifiers/visualizer';
import { useEffect, useMemo, useState } from 'react';

import {
  BoxContextCustomObjects,
  defaultBoxContextCustomObjects,
} from './custom';

type SandboxObjectTypeMap = {
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
    instance: SandboxVisualizer<SandboxStateType>;
    value: SandboxAnyVisualizer;
    dbObject: DbVisualizer;
    dbObjectSaved: DbVisualizerSaved;
  };
};

const verifiers = {
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
};

type Instance<T extends keyof SandboxObjectTypeMap> =
  SandboxObjectTypeMap[T]['instance'];
type Value<T extends keyof SandboxObjectTypeMap> =
  SandboxObjectTypeMap[T]['value'];
type DbObject<T extends keyof SandboxObjectTypeMap> =
  SandboxObjectTypeMap[T]['dbObject'];
type DbObjectSaved<T extends keyof SandboxObjectTypeMap> =
  SandboxObjectTypeMap[T]['dbObjectSaved'];

export const defaultBoxContextSandboxObject: BoxContextSandboxObject<never> = {
  custom: defaultBoxContextCustomObjects,
  customPanel: {
    visible: false,
    setVisible: () => {},
  },
  errorMessage: null,
  instance: null,
  value: null,
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
  customPanel: {
    visible: boolean;
    setVisible: (visible: boolean) => void;
  };
  custom: BoxContextCustomObjects;
  errorMessage: string | null;
  instance: Instance<T> | null;
  value: Value<T> | null;
  parameters: {
    default: ParsedParameters<SandboxParameters> | null;
    value: ParsedParameters<SandboxParameters> | null;
    setValue: (value: ParsedParameters<SandboxParameters>) => void;
  };
  select: {
    value: CatalogOption<DbObjectSaved<T>> | null;
    setValue: (value: CatalogOption<DbObjectSaved<T>> | null) => void;
    options: CatalogOptions<DbObjectSaved<T>>;
  };
};

export function useBoxContextSandboxObject<
  T extends keyof SandboxObjectTypeMap,
>({
  customPanelVisible,
  setCustomPanelVisible,
  builtInOptions,
  addSavedObjectMutation,
  setSavedObjectMutation,
  removeSavedObjectMutation,
  savedObjects,
  type,
}: {
  type: T;
  customPanelVisible: boolean;
  setCustomPanelVisible: (visible: boolean) => void;
  builtInOptions: Array<CatalogGroup<DbObjectSaved<T>>>;
  addSavedObjectMutation: UseMutationResult<
    DbObjectSaved<T>,
    unknown,
    DbObject<T>
  >;
  setSavedObjectMutation: UseMutationResult<
    DbObjectSaved<T>,
    unknown,
    DbObjectSaved<T>
  >;
  removeSavedObjectMutation: UseMutationResult<void, unknown, DbObjectSaved<T>>;
  savedObjects: Array<DbObjectSaved<T>> | undefined;
}) {
  const objectOptions = useMemo(
    () =>
      [
        ...builtInOptions,
        {
          key: 'custom',
          label: 'Custom',
          options: (savedObjects ?? []).map((object) => ({
            key: object.key,
            label: object.name,
            value: object,
            type: 'custom',
          })),
        },
      ] as Array<CatalogGroup<DbObjectSaved<T>>>,
    [builtInOptions, savedObjects],
  );

  const [selectedOptionKey, setSelectedOptionKey] = useState<string | null>(
    null,
  );

  const selectedOptionObject = useMemo(() => {
    if (selectedOptionKey === null) {
      return null;
    }

    const flattenedOptions = objectOptions.flatMap((group) => group.options);
    return (
      flattenedOptions.find((option) => option.key === selectedOptionKey) ??
      null
    );
  }, [objectOptions, selectedOptionKey]);

  useEffect(() => {
    if (selectedOptionKey !== null) {
      return;
    }
    const option = objectOptions.at(0)?.options.at(0);
    if (option === undefined) {
      return;
    }

    setSelectedOptionKey(option.key);
  }, [objectOptions, selectedOptionKey]);

  const {
    mutate: addSavedObject,
    data: latestNewObject,
    reset: resetAddObjectMutation,
  } = addSavedObjectMutation;
  const { mutate: setSavedObject } = setSavedObjectMutation;
  const { mutate: removeSavedObject } = removeSavedObjectMutation;

  const selectedCustomObject = useMemo(() => {
    if (
      selectedOptionObject === null ||
      selectedOptionObject.type === 'built-in'
    ) {
      return null;
    }

    return selectedOptionObject.value;
  }, [selectedOptionObject]);

  const custom = useMemo(() => {
    return {
      selected: selectedCustomObject,
      add: (value) => {
        return addSavedObject(value);
      },
      set: (value) => {
        return setSavedObject(value);
      },
      remove: (value) => {
        if (selectedOptionKey === value.key) {
          setSelectedOptionKey(null);
        }
        return removeSavedObject(value);
      },
    } satisfies BoxContextSandboxObject<T>['custom'];
  }, [
    selectedCustomObject,
    addSavedObject,
    setSavedObject,
    selectedOptionKey,
    removeSavedObject,
  ]);

  useEffect(() => {
    const flattenedOptions = objectOptions.flatMap((group) => group.options);
    if (latestNewObject?.key !== undefined) {
      const newSelectedOption = flattenedOptions.find(
        (option) => option.key === latestNewObject.key,
      );
      if (newSelectedOption) {
        setSelectedOptionKey(newSelectedOption.key);
      }
      resetAddObjectMutation();
    }
  }, [latestNewObject?.key, objectOptions, resetAddObjectMutation]);

  const { objectEvaled, errorMessage: errorMessageEval } = useMemo(() => {
    const { value: object = null } = selectedOptionObject ?? {};

    if (object === null) {
      return { objectEvaled: null, errorMessage: null };
    }

    try {
      return {
        objectEvaled: evalWithAlgoSandbox(object.files['index.ts']) as Value<T>,
        errorMessage: null,
      };
    } catch (e) {
      console.error(e);
      return {
        objectEvaled: null,
        errorMessage: `Error during component code evaluation.\nYou may have a syntax error.\n\n${e}`,
      };
    }
  }, [selectedOptionObject]);

  const { data: objectInstancer, errorMessage: errorMessageInstancer } =
    useMemo(() => {
      return tryEvaluate(
        () => {
          if (objectEvaled === null) {
            return null;
          }

          function isParameterized(
            object: Parameterized<Instance<T>, SandboxParameters> | Instance<T>,
          ): object is Parameterized<Instance<T>, SandboxParameters> {
            return 'parameters' in object;
          }

          if (isParameterized(objectEvaled)) {
            verifiers[type].parameterized.parse(objectEvaled);
            return objectEvaled;
          }

          // Verify objectEvaled has necessary fields
          verifiers[type].instance.parse(objectEvaled);

          return {
            name: objectEvaled.name,
            parameters: {},
            create: () => {
              return objectEvaled as Instance<T>;
            },
          } satisfies Parameterized<Instance<T>, Record<string, never>>;
        },
        (e) =>
          `Error in component definition.\nEnsure that your returned component has the correct fields.\n\n${e}`,
      );
    }, [objectEvaled, type]);

  const defaultParameters = useMemo(() => {
    if (objectInstancer === null) {
      return null;
    }
    return getDefaultParameters(
      objectInstancer.parameters,
    ) as ParsedParameters<SandboxParameters>;
  }, [objectInstancer]);

  const [objectParameters, setObjectParameters] = useState(defaultParameters);

  useEffect(() => {
    setObjectParameters(defaultParameters);
  }, [defaultParameters]);

  const objectInstance = useMemo(() => {
    if (
      objectInstancer !== null &&
      objectParameters !== null &&
      Object.keys(objectInstancer.parameters).every(
        (k) => k in objectParameters,
      )
    ) {
      return objectInstancer.create(objectParameters);
    }
    return null;
  }, [objectInstancer, objectParameters]);

  const errorMessage = useMemo(() => {
    return errorMessageEval ?? errorMessageInstancer;
  }, [errorMessageEval, errorMessageInstancer]);

  const object = useMemo(() => {
    return {
      custom,
      customPanel: {
        visible: customPanelVisible,
        setVisible: setCustomPanelVisible,
      },
      errorMessage,
      instance: objectInstance,
      value: objectEvaled,
      parameters: {
        default: defaultParameters,
        value: objectParameters,
        setValue: setObjectParameters,
      },
      select: {
        value: selectedOptionObject,
        setValue: (option) => {
          setSelectedOptionKey(option?.key ?? null);
        },
        options: objectOptions,
      },
    } satisfies BoxContextSandboxObject<T>;
  }, [
    errorMessage,
    objectEvaled,
    objectInstance,
    objectParameters,
    objectOptions,
    custom,
    customPanelVisible,
    setCustomPanelVisible,
    defaultParameters,
    selectedOptionObject,
  ]);

  return object;
}
