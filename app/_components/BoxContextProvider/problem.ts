import { problemOptions } from '@/app/_constants/catalog';
import { SelectOption, SelectOptions } from '@/components/Select';
import {
  SandboxParameteredProblem,
  SandboxProblem,
  SandboxStateName,
} from '@/lib/algo-sandbox/core';
import { isParameteredProblem } from '@/utils/isParametered';
import { useMemo, useState } from 'react';

const defaultProblemOption = problemOptions[0].options[0];

type Problem =
  | SandboxProblem<SandboxStateName>
  | SandboxParameteredProblem<SandboxStateName, any>;

export type BoxContextProblem = {
  select: {
    value: SelectOption<Problem>;
    setValue: (value: SelectOption<Problem>) => void;
    options: SelectOptions<Problem>;
  };
  instance: SandboxProblem<SandboxStateName>;
};

export const defaultBoxContextProblem: BoxContextProblem = {
  select: { value: defaultProblemOption, setValue: () => {}, options: [] },
  instance: {} as SandboxProblem<SandboxStateName>,
};

export function useBoxContextProblem() {
  const [selectedProblemOption, setSelectedProblemOption] =
    useState(defaultProblemOption);

  const problemInstance = useMemo(() => {
    const { value } = selectedProblemOption;

    if (isParameteredProblem(value)) {
      return value.create();
    }

    return value;
  }, [selectedProblemOption]);

  const problem = useMemo(() => {
    return {
      select: {
        value: selectedProblemOption,
        setValue: setSelectedProblemOption,
        options: problemOptions,
      },
      instance: problemInstance,
    } satisfies BoxContextProblem;
  }, [problemInstance, selectedProblemOption]);

  return problem;
}