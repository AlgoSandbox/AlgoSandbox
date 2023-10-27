import {
  getDefaultParameters,
  Parametered,
  ParsedParameters,
  SandboxAlgorithm,
  SandboxParameters,
  SandboxProblem,
  SandboxStateName,
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
} from '@types';
import {
  DbAlgorithm,
  DbAlgorithmSaved,
  DbProblem,
  DbProblemSaved,
  DbVisualizer,
  DbVisualizerSaved,
} from '@utils/db';
import evalWithAlgoSandbox from '@utils/evalWithAlgoSandbox';
import { useEffect, useMemo, useState } from 'react';

import {
  BoxContextCustomObjects,
  defaultBoxContextCustomObjects,
} from './custom';

type SandboxObjectTypeMap = {
  algorithm: {
    instance: SandboxAlgorithm<SandboxStateName, SandboxStateName>;
    value: SandboxAnyAlgorithm;
    dbObject: DbAlgorithm;
    dbObjectSaved: DbAlgorithmSaved;
  };
  problem: {
    instance: SandboxProblem<SandboxStateName>;
    value: SandboxAnyProblem;
    dbObject: DbProblem;
    dbObjectSaved: DbProblemSaved;
  };
  visualizer: {
    instance: SandboxVisualizer<SandboxStateName>;
    value: SandboxAnyVisualizer;
    dbObject: DbVisualizer;
    dbObjectSaved: DbVisualizerSaved;
  };
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
    [builtInOptions, savedObjects]
  );

  const [selectedOptionObject, setSelectedObjectOption] =
    useState<CatalogOption<DbObjectSaved<T>> | null>(null);

  useEffect(() => {
    if (selectedOptionObject !== null) {
      return;
    }
    const option = objectOptions.at(0)?.options.at(0);
    if (option === undefined) {
      return;
    }

    setSelectedObjectOption(option);
  }, [objectOptions, selectedOptionObject]);

  const {
    mutate: addSavedObject,
    data: latestNewObject,
    reset: resetAddObjectMutation,
  } = addSavedObjectMutation;
  const {
    mutate: setSavedObject,
    data: latestSavedObject,
    reset: resetSetObjectMutation,
  } = setSavedObjectMutation;
  const { mutate: removeSavedObject } = removeSavedObjectMutation;

  const selectedCustomAlgorithm = useMemo(() => {
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
      selected: selectedCustomAlgorithm,
      add: (value) => {
        return addSavedObject(value);
      },
      set: (value) => {
        return setSavedObject(value);
      },
      remove: (value) => {
        if (selectedOptionObject?.key === value.key) {
          setSelectedObjectOption(null);
        }
        return removeSavedObject(value);
      },
    } satisfies BoxContextSandboxObject<T>['custom'];
  }, [
    addSavedObject,
    removeSavedObject,
    selectedOptionObject?.key,
    selectedCustomAlgorithm,
    setSavedObject,
  ]);

  useEffect(() => {
    const flattenedOptions = objectOptions.flatMap((group) => group.options);
    if (latestNewObject?.key !== undefined) {
      const newSelectedOption = flattenedOptions.find(
        (option) => option.key === latestNewObject.key
      );
      if (newSelectedOption) {
        setSelectedObjectOption(newSelectedOption);
      }
      resetAddObjectMutation();
    }
    if (latestSavedObject?.key !== undefined) {
      const newSelectedOption = flattenedOptions.find(
        (option) => option.key === latestSavedObject.key
      );
      if (newSelectedOption) {
        setSelectedObjectOption(newSelectedOption);
      }
      resetSetObjectMutation();
    }
  }, [
    objectOptions,
    latestNewObject?.key,
    latestSavedObject?.key,
    resetAddObjectMutation,
    resetSetObjectMutation,
  ]);

  const objectEvaled = useMemo(() => {
    const { value: object = null } = selectedOptionObject ?? {};

    if (object === null) {
      return null;
    }

    try {
      return evalWithAlgoSandbox(object.typescriptCode) as Value<T>;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [selectedOptionObject]);

  const objectInstancer = useMemo(() => {
    if (objectEvaled === null) {
      return null;
    }

    function isParametered(
      object: Parametered<Instance<T>, SandboxParameters> | Instance<T>
    ): object is Parametered<Instance<T>, SandboxParameters> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (object as any).parameters !== undefined;
    }

    if (isParametered(objectEvaled)) {
      return objectEvaled;
    }

    return {
      name: objectEvaled.name,
      parameters: {},
      create: () => {
        return objectEvaled as Instance<T>;
      },
    } satisfies Parametered<Instance<T>, Record<string, never>>;
  }, [objectEvaled]);

  const defaultParameters = useMemo(() => {
    if (objectInstancer === null) {
      return null;
    }
    return getDefaultParameters(
      objectInstancer.parameters
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
        (k) => k in objectParameters
      )
    ) {
      return objectInstancer.create(objectParameters);
    }
    return null;
  }, [objectInstancer, objectParameters]);

  const algorithm = useMemo(() => {
    return {
      custom,
      customPanel: {
        visible: customPanelVisible,
        setVisible: setCustomPanelVisible,
      },
      instance: objectInstance,
      value: objectEvaled,
      parameters: {
        default: defaultParameters,
        value: objectParameters,
        setValue: setObjectParameters,
      },
      select: {
        value: selectedOptionObject,
        setValue: setSelectedObjectOption,
        options: objectOptions,
      },
    } satisfies BoxContextSandboxObject<T>;
  }, [
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

  return algorithm;
}
