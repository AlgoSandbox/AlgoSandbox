import {
  CatalogGroup,
  CatalogOption,
  CatalogOptions,
  algorithmOptions as defaultAlgorithmOptions,
} from '@constants/catalog';
import {
  getDefaultParameters,
  ParsedParameters,
  SandboxAlgorithm,
  SandboxParameteredAlgorithm,
  SandboxParameters,
  SandboxStateName,
} from '@algo-sandbox/core';
import { isParameteredAlgorithm } from '@utils';
import { useEffect, useMemo, useState } from 'react';
import { DbSandboxObject, DbSavedSandboxObject } from '@utils/db/types';
import {
  useAddSavedAlgorithmMutation,
  useRemoveSavedAlgorithmMutation,
  useSavedAlgorithmsQuery,
  useSetSavedAlgorithmMutation,
} from '@utils/db';
import evalWithAlgoSandbox from '@utils/evalWithAlgoSandbox';

type Algorithm =
  | SandboxAlgorithm<SandboxStateName, any>
  | SandboxParameteredAlgorithm<SandboxStateName, any, any>;

export type BoxContextAlgorithm = {
  customPanel: {
    visible: boolean;
    setVisible: (visible: boolean) => void;
  };
  custom: {
    selected: DbSavedSandboxObject | null;
    values: Array<DbSavedSandboxObject>;
    add: (value: DbSandboxObject) => void;
    set: (value: DbSavedSandboxObject) => void;
    remove: (value: DbSavedSandboxObject) => void;
  };
  instance: SandboxAlgorithm<SandboxStateName, any> | null;
  parameters: {
    default: ParsedParameters<SandboxParameters> | null;
    value: ParsedParameters<SandboxParameters> | null;
    setValue: (value: ParsedParameters<SandboxParameters>) => void;
  };
  select: {
    value: CatalogOption<Algorithm | null>;
    setValue: (value: CatalogOption<Algorithm | null>) => void;
    options: CatalogOptions<Algorithm | null>;
  };
};

const defaultAlgorithmOption = defaultAlgorithmOptions[0].options[0];

export const defaultBoxContextAlgorithm: BoxContextAlgorithm = {
  custom: {
    selected: null,
    values: [],
    add: () => {},
    set: () => {},
    remove: () => {},
  },
  customPanel: {
    visible: false,
    setVisible: () => {},
  },
  instance: {} as SandboxAlgorithm<SandboxStateName, any>,
  parameters: {
    default: {},
    value: {},
    setValue: () => {},
  },
  select: {
    value: defaultAlgorithmOption,
    setValue: () => {},
    options: [],
  },
};

export function useBoxContextAlgorithm({
  customPanelVisible,
  setCustomPanelVisible,
}: {
  customPanelVisible: boolean;
  setCustomPanelVisible: (visible: boolean) => void;
}) {
  const [selectedAlgorithmOption, setSelectedAlgorithmOption] = useState(
    defaultAlgorithmOption
  );
  const [algorithmOptions, setAlgorithmOptions] = useState<
    Array<CatalogGroup<Algorithm | null>>
  >(defaultAlgorithmOptions);

  const { data: savedAlgorithms } = useSavedAlgorithmsQuery();
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
      selectedAlgorithmOption.type === 'built-in' ||
      savedAlgorithms === undefined
    ) {
      return null;
    }

    return (
      savedAlgorithms.find(
        (value) => value.key === selectedAlgorithmOption.key
      ) ?? null
    );
  }, [
    savedAlgorithms,
    selectedAlgorithmOption.key,
    selectedAlgorithmOption.type,
  ]);

  const custom = useMemo(() => {
    return {
      selected: selectedCustomAlgorithm,
      values: savedAlgorithms ?? [],
      add: (value) => {
        return addSavedAlgorithm(value);
      },
      set: async (value) => {
        return await setSavedAlgorithm(value);
      },
      remove: (value) => {
        if (selectedAlgorithmOption.key === value.key) {
          setSelectedAlgorithmOption(defaultAlgorithmOption);
        }
        return removeSavedAlgorithm(value);
      },
    } satisfies BoxContextAlgorithm['custom'];
  }, [
    addSavedAlgorithm,
    removeSavedAlgorithm,
    savedAlgorithms,
    selectedAlgorithmOption.key,
    selectedCustomAlgorithm,
    setSavedAlgorithm,
  ]);

  useEffect(() => {
    if (savedAlgorithms === undefined) {
      return;
    }

    const newOptions = savedAlgorithms.map((algorithm) => {
      let evaledAlgorithm: Algorithm | null;
      try {
        evaledAlgorithm = evalWithAlgoSandbox(algorithm.typescriptCode);
      } catch (e) {
        evaledAlgorithm = null;
        console.error(e);
      }
      const newOption: CatalogOption<Algorithm | null> = {
        label: algorithm.name,
        key: algorithm.key,
        type: 'custom',
        value: evaledAlgorithm,
      };

      return newOption;
    });

    const customGroup: CatalogGroup<Algorithm | null> = {
      key: 'custom',
      label: 'Custom',
      options: newOptions,
    };

    setAlgorithmOptions((algorithmOptions) => [
      ...algorithmOptions.filter((group) => group.key !== 'custom'),
      customGroup,
    ]);

    if (latestNewAlgorithm?.key !== undefined) {
      const newSelectedOption = newOptions.find(
        (option) => option.key === latestNewAlgorithm.key
      );
      if (newSelectedOption) {
        setSelectedAlgorithmOption(newSelectedOption);
      }
      resetAddAlgorithmMutation();
    }

    if (latestSavedAlgorithm?.key !== undefined) {
      const newSelectedOption = newOptions.find(
        (option) => option.key === latestSavedAlgorithm.key
      );
      if (newSelectedOption) {
        setSelectedAlgorithmOption(newSelectedOption);
      }
      resetSetAlgorithmMutation();
    }
  }, [
    latestNewAlgorithm?.key,
    latestSavedAlgorithm?.key,
    resetAddAlgorithmMutation,
    resetSetAlgorithmMutation,
    savedAlgorithms,
  ]);

  const algorithmInstancer = useMemo(() => {
    const { value: algorithm } = selectedAlgorithmOption;

    if (algorithm === null) {
      return null;
    }

    if (isParameteredAlgorithm(algorithm)) {
      return algorithm;
    }

    return {
      name: algorithm.name,
      parameters: {},
      create: () => {
        return algorithm;
      },
    } satisfies SandboxParameteredAlgorithm<
      typeof algorithm.accepts,
      typeof algorithm.outputs,
      {}
    >;
  }, [selectedAlgorithmOption]);

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
    custom,
    customPanelVisible,
    setCustomPanelVisible,
    algorithmInstance,
    defaultParameters,
    algorithmParameters,
    selectedAlgorithmOption,
    algorithmOptions,
  ]);

  useEffect(() => {
    setAlgorithmParameters(defaultParameters);
  }, [defaultParameters]);

  return algorithm;
}
