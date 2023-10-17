import { visualizerOptions } from '@constants/catalog';
import { SelectOption, SelectOptions } from '@components';
import {
  SandboxVisualizer,
  SandboxStateName,
  SandboxParameteredVisualizer,
} from '@algo-sandbox/core';
import { isParameteredVisualizer } from '@utils';
import { useMemo, useState } from 'react';

const defaultVisualizerOption = visualizerOptions[0].options[0];
export const defaultBoxContextVisualizer: BoxContextVisualizer = {
  select: {
    value: defaultVisualizerOption,
    setValue: () => {},
    options: [],
  },
  instance: defaultVisualizerOption.value as SandboxVisualizer<any>,
};

type Visualizer =
  | SandboxVisualizer<any>
  | SandboxParameteredVisualizer<any, any>;

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
