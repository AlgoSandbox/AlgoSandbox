import {
  SandboxParameteredVisualizer,
  SandboxStateName,
  SandboxVisualizer,
} from '@algo-sandbox/core';
import { visualizerOptions } from '@constants/catalog';
import { isParameteredVisualizer } from '@utils';
import { useMemo, useState } from 'react';

import { SelectOption, SelectOptions } from '../../ui';

const defaultVisualizerOption = visualizerOptions[0].options[0];
export const defaultBoxContextVisualizer: BoxContextVisualizer = {
  select: {
    value: defaultVisualizerOption,
    setValue: () => {},
    options: [],
  },
  instance:
    defaultVisualizerOption.value as SandboxVisualizer<SandboxStateName>,
};

type Visualizer =
  | SandboxVisualizer<SandboxStateName>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | SandboxParameteredVisualizer<SandboxStateName, any>;

export type BoxContextVisualizer = {
  select: {
    value: SelectOption<Visualizer>;
    setValue: (value: SelectOption<Visualizer>) => void;
    options: SelectOptions<Visualizer>;
  };
  instance: SandboxVisualizer<SandboxStateName>;
};

export default function useBoxContextVisualizer() {
  const [selectedVisualizerOption, setSelectedVisualizerOption] = useState(
    defaultVisualizerOption
  );

  const visualizerInstance = useMemo(() => {
    const { value } = selectedVisualizerOption;

    if (isParameteredVisualizer(value)) {
      return value.create();
    }

    return value;
  }, [selectedVisualizerOption]);

  const visualizer = useMemo(() => {
    return {
      select: {
        options: visualizerOptions,
        setValue: setSelectedVisualizerOption,
        value: selectedVisualizerOption,
      },
      instance: visualizerInstance,
    } satisfies BoxContextVisualizer;
  }, [selectedVisualizerOption, visualizerInstance]);

  return visualizer;
}
