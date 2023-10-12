import { algorithmOptions } from '@/app/_constants/catalog';
import { SelectOption, SelectOptions } from '@/components/Select';
import {
  getDefaultParameters,
  ParsedParameters,
  SandboxAlgorithm,
  SandboxParameteredAlgorithm,
  SandboxParameters,
  SandboxStateName,
} from '@/lib/algo-sandbox/core';
import { isParameteredAlgorithm } from '@/utils/isParametered';
import { useEffect, useMemo, useState } from 'react';

type Algorithm =
  | SandboxAlgorithm<SandboxStateName, any>
  | SandboxParameteredAlgorithm<SandboxStateName, any, any>;

export type BoxContextAlgorithm = {
  select: {
    value: SelectOption<Algorithm>;
    setValue: (value: SelectOption<Algorithm>) => void;
    options: SelectOptions<Algorithm>;
  };
  instance: SandboxAlgorithm<SandboxStateName, any>;
  parameters: {
    default: ParsedParameters<SandboxParameters>;
    value: ParsedParameters<SandboxParameters>;
    setValue: (value: ParsedParameters<SandboxParameters>) => void;
  };
};

const defaultAlgorithmOption = algorithmOptions[0].options[0];

export const defaultBoxContextAlgorithm: BoxContextAlgorithm = {
  select: {
    value: defaultAlgorithmOption,
    setValue: () => {},
    options: [],
  },
  parameters: {
    default: {},
    value: {},
    setValue: () => {},
  },
  instance: {} as SandboxAlgorithm<SandboxStateName, any>,
};

export function useBoxContextAlgorithm() {
  const [selectedAlgorithmOption, setSelectedAlgorithmOption] = useState(
    defaultAlgorithmOption
  );

  const algorithmInstancer = useMemo(() => {
    const { value } = selectedAlgorithmOption;

    if (isParameteredAlgorithm(value)) {
      return value;
    }

    return {
      name: value.name,
      parameters: {},
      create: () => {
        return value;
      },
    } satisfies SandboxParameteredAlgorithm<
      typeof value.accepts,
      typeof value.outputs,
      {}
    >;
  }, [selectedAlgorithmOption]);

  const defaultParameters = useMemo(
    () =>
      getDefaultParameters(
        algorithmInstancer.parameters
      ) as ParsedParameters<SandboxParameters>,
    [algorithmInstancer.parameters]
  );

  const [algorithmParameters, setAlgorithmParameters] =
    useState(defaultParameters);

  const algorithmInstance = useMemo(
    () => algorithmInstancer.create(algorithmParameters),
    [algorithmInstancer, algorithmParameters]
  );

  const algorithm = useMemo(() => {
    return {
      select: {
        value: selectedAlgorithmOption,
        setValue: setSelectedAlgorithmOption,
        options: algorithmOptions,
      },
      instance: algorithmInstance,
      parameters: {
        default: defaultParameters,
        value: algorithmParameters,
        setValue: setAlgorithmParameters,
      },
    } satisfies BoxContextAlgorithm;
  }, [
    algorithmInstance,
    algorithmParameters,
    defaultParameters,
    selectedAlgorithmOption,
  ]);

  useEffect(() => {
    setAlgorithmParameters(defaultParameters);
  }, [defaultParameters]);

  return algorithm;
}
