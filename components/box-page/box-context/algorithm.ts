import {
  getDefaultParameters,
  ParsedParameters,
  SandboxAlgorithm,
  SandboxParameteredAlgorithm,
  SandboxParameters,
  SandboxStateName,
} from '@algo-sandbox/core';
import {
  CatalogGroup,
  CatalogOption,
  CatalogOptions,
} from '@constants/catalog';
import { isParameteredAlgorithm } from '@utils';
import {
  DbSavedAlgorithm,
  useAddSavedAlgorithmMutation,
  useRemoveSavedAlgorithmMutation,
  useSetSavedAlgorithmMutation,
} from '@utils/db';
import evalWithAlgoSandbox from '@utils/evalWithAlgoSandbox';
import { useEffect, useMemo, useState } from 'react';

import {
  BoxContextCustomObjects,
  defaultBoxContextCustomObjects,
} from './custom';

type Algorithm =
  | SandboxAlgorithm<SandboxStateName, any>
  | SandboxParameteredAlgorithm<SandboxStateName, any, any>;

export type BoxContextAlgorithm = {
  customPanel: {
    visible: boolean;
    setVisible: (visible: boolean) => void;
  };
  custom: BoxContextCustomObjects;
  instance: SandboxAlgorithm<SandboxStateName, any> | null;
  value: Algorithm | null;
  parameters: {
    default: ParsedParameters<SandboxParameters> | null;
    value: ParsedParameters<SandboxParameters> | null;
    setValue: (value: ParsedParameters<SandboxParameters>) => void;
  };
  select: {
    value: CatalogOption<DbSavedAlgorithm> | undefined;
    setValue: (value: CatalogOption<DbSavedAlgorithm> | undefined) => void;
    options: CatalogOptions<DbSavedAlgorithm>;
  };
};

export const defaultBoxContextAlgorithm: BoxContextAlgorithm = {
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
    value: undefined,
    setValue: () => {},
    options: [],
  },
};

export function useBoxContextAlgorithm({
  customPanelVisible,
  setCustomPanelVisible,
  algorithmOptions,
}: {
  customPanelVisible: boolean;
  setCustomPanelVisible: (visible: boolean) => void;
  algorithmOptions: Array<CatalogGroup<DbSavedAlgorithm>>;
}) {
  const [selectedAlgorithmOption, setSelectedAlgorithmOption] = useState<
    CatalogOption<DbSavedAlgorithm> | undefined
  >();

  useEffect(() => {
    if (selectedAlgorithmOption !== undefined) {
      return;
    }
    const option = algorithmOptions.at(0)?.options.at(0);
    if (option === undefined) {
      return;
    }

    setSelectedAlgorithmOption(option);
  }, [algorithmOptions, selectedAlgorithmOption]);

  const {
    mutate: addSavedAlgorithm,
    data: latestNewAlgorithm,
    reset: resetAddAlgorithmMutation,
  } = useAddSavedAlgorithmMutation();
  const {
    mutateAsync: setSavedAlgorithm,
    data: latestSavedAlgorithm,
    reset: resetSetAlgorithmMutation,
  } = useSetSavedAlgorithmMutation();
  const { mutate: removeSavedAlgorithm } = useRemoveSavedAlgorithmMutation();

  const selectedCustomAlgorithm = useMemo(() => {
    if (
      selectedAlgorithmOption === undefined ||
      selectedAlgorithmOption.type === 'built-in'
    ) {
      return null;
    }

    return selectedAlgorithmOption.value;
  }, [selectedAlgorithmOption]);

  const custom = useMemo(() => {
    return {
      selected: selectedCustomAlgorithm,
      add: (value) => {
        return addSavedAlgorithm(value);
      },
      set: async (value) => {
        return await setSavedAlgorithm(value);
      },
      remove: (value) => {
        if (selectedAlgorithmOption?.key === value.key) {
          setSelectedAlgorithmOption(undefined);
        }
        return removeSavedAlgorithm(value);
      },
    } satisfies BoxContextAlgorithm['custom'];
  }, [
    addSavedAlgorithm,
    removeSavedAlgorithm,
    selectedAlgorithmOption?.key,
    selectedCustomAlgorithm,
    setSavedAlgorithm,
  ]);

  useEffect(() => {
    const flattenedAlgorithmOptions = algorithmOptions.flatMap(
      (group) => group.options
    );
    if (latestNewAlgorithm?.key !== undefined) {
      const newSelectedOption = flattenedAlgorithmOptions.find(
        (option) => option.key === latestNewAlgorithm.key
      );
      if (newSelectedOption) {
        setSelectedAlgorithmOption(newSelectedOption);
      }
      resetAddAlgorithmMutation();
    }
    if (latestSavedAlgorithm?.key !== undefined) {
      const newSelectedOption = flattenedAlgorithmOptions.find(
        (option) => option.key === latestSavedAlgorithm.key
      );
      if (newSelectedOption) {
        setSelectedAlgorithmOption(newSelectedOption);
      }
      resetSetAlgorithmMutation();
    }
  }, [
    algorithmOptions,
    latestNewAlgorithm?.key,
    latestSavedAlgorithm?.key,
    resetAddAlgorithmMutation,
    resetSetAlgorithmMutation,
  ]);

  const algorithmEvaled = useMemo(() => {
    const { value: algorithmObject = null } = selectedAlgorithmOption ?? {};

    if (algorithmObject === null) {
      return null;
    }

    try {
      return evalWithAlgoSandbox(algorithmObject.typescriptCode) as Algorithm;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [selectedAlgorithmOption]);

  const algorithmInstancer = useMemo(() => {
    if (algorithmEvaled === null) {
      return null;
    }

    if (isParameteredAlgorithm(algorithmEvaled)) {
      return algorithmEvaled;
    }

    return {
      name: algorithmEvaled.name,
      parameters: {},
      create: () => {
        return algorithmEvaled;
      },
    } satisfies SandboxParameteredAlgorithm<
      typeof algorithmEvaled.accepts,
      typeof algorithmEvaled.outputs,
      Record<string, never>
    >;
  }, [algorithmEvaled]);

  const defaultParameters = useMemo(() => {
    if (algorithmInstancer === null) {
      return null;
    }
    return getDefaultParameters(
      algorithmInstancer.parameters
    ) as ParsedParameters<SandboxParameters>;
  }, [algorithmInstancer]);

  const [algorithmParameters, setAlgorithmParameters] =
    useState(defaultParameters);

  const algorithmInstance = useMemo(() => {
    if (algorithmInstancer !== null && algorithmParameters !== null) {
      return algorithmInstancer.create(algorithmParameters);
    }
    return null;
  }, [algorithmInstancer, algorithmParameters]);

  const algorithm = useMemo(() => {
    return {
      custom,
      customPanel: {
        visible: customPanelVisible,
        setVisible: setCustomPanelVisible,
      },
      instance: algorithmInstance,
      value: algorithmEvaled,
      parameters: {
        default: defaultParameters,
        value: algorithmParameters,
        setValue: setAlgorithmParameters,
      },
      select: {
        value: selectedAlgorithmOption,
        setValue: setSelectedAlgorithmOption,
        options: algorithmOptions,
      },
    } satisfies BoxContextAlgorithm;
  }, [
    algorithmEvaled,
    algorithmInstance,
    algorithmParameters,
    algorithmOptions,
    custom,
    customPanelVisible,
    setCustomPanelVisible,
    defaultParameters,
    selectedAlgorithmOption,
  ]);

  useEffect(() => {
    setAlgorithmParameters(defaultParameters);
  }, [defaultParameters]);

  return algorithm;
}
