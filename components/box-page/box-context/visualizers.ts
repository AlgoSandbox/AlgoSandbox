import { SandboxKey } from '@algo-sandbox/components/SandboxKey';
import {
  getDefaultParameters,
  ParsedParameters,
  SandboxEvaluated,
  SandboxParameters,
  SandboxStateType,
  SandboxVisualizer,
} from '@algo-sandbox/core';
import { CatalogGroup } from '@constants/catalog';
import { DbVisualizerSaved } from '@utils/db';
import { evalSavedObject } from '@utils/evalSavedObject';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type BoxContextVisualizers = {
  aliases: Record<string, SandboxKey<'visualizer'>>;
  order: Array<string>;
  setAlias: (alias: string, key: SandboxKey<'visualizer'>) => void;
  parameters: {
    default: Record<string, ParsedParameters<SandboxParameters> | null>;
    value: Record<string, ParsedParameters<SandboxParameters> | null>;
    setValue: (
      alias: string,
      value: ParsedParameters<SandboxParameters>,
    ) => void;
  };
  appendAlias: (alias: string, key: SandboxKey<'visualizer'>) => void;
  removeAlias: (alias: string) => void;
  instances: Record<
    string,
    SandboxEvaluated<SandboxVisualizer<SandboxStateType, unknown>> | undefined
  >;
};

export default function useBoxContextVisualizers({
  defaultAliases,
  defaultOrder,
  onOrderChange,
  onAliasesChange,
  builtInOptions,
}: {
  builtInOptions: Array<CatalogGroup<DbVisualizerSaved>>;
  defaultOrder: Array<string>;
  defaultAliases: Record<string, SandboxKey<'visualizer'>>;
  onOrderChange: (order: Array<string>) => void;
  onAliasesChange: (aliases: Record<string, SandboxKey<'visualizer'>>) => void;
}) {
  const [aliases, setAliases] = useState(defaultAliases);
  const [order, setOrder] = useState(defaultOrder);
  const [parameters, setParameters] = useState<
    Record<string, ParsedParameters<SandboxParameters> | null>
  >({});

  console.log('defaultAliases', defaultAliases);

  useEffect(() => {
    setAliases(defaultAliases);
  }, [defaultAliases]);

  useEffect(() => {
    setOrder(defaultOrder);
  }, [defaultOrder]);

  const handleOrderChange = useCallback(
    (newOrder: Array<string>) => {
      setOrder(newOrder);
      onOrderChange(newOrder);
    },
    [onOrderChange],
  );

  const handleAliasesChange = useCallback(
    (newAliases: Record<string, SandboxKey<'visualizer'>>) => {
      setAliases(newAliases);
      onAliasesChange(newAliases);
    },
    [onAliasesChange],
  );

  const selectedVisualizers = useMemo(() => {
    return Object.fromEntries(
      Object.entries(aliases).map(([alias, key]) => {
        const option = builtInOptions
          .flatMap((group) => group.options)
          .find((option) => option.value.key === key);

        if (option === undefined) {
          throw new Error(`Visualizer ${key} not found`);
        }

        return [alias, option];
      }),
    );
  }, [aliases, builtInOptions]);

  const evaluations = useMemo(() => {
    return Object.fromEntries(
      Object.entries(selectedVisualizers).map(([alias, option]) => {
        const value = evalSavedObject<'visualizer'>(option.value).objectEvaled;

        return [
          alias,
          value
            ? {
                value,
                name: option.label,
                key: option.value.key,
              }
            : undefined,
        ];
      }),
    );
  }, [selectedVisualizers]);

  const defaultParameters = useMemo(() => {
    return Object.fromEntries(
      Object.entries(evaluations).map(([alias, evaluation]) => {
        const visualizer = evaluation?.value;
        if (visualizer === undefined) {
          return [alias, null];
        }

        const defaultParams =
          'parameters' in visualizer
            ? getDefaultParameters(visualizer.parameters)
            : null;

        return [alias, defaultParams];
      }),
    );
  }, [evaluations]);

  const instances = useMemo(() => {
    return Object.fromEntries(
      Object.entries(evaluations).map(([alias, evaluation]) => {
        if (evaluation === undefined) {
          return [alias, undefined];
        }

        const visualizer = evaluation.value;
        const parameters = defaultParameters[alias];
        const instance =
          'parameters' in visualizer
            ? visualizer.create(parameters ?? {})
            : visualizer;

        return [
          alias,
          { value: instance, name: evaluation.name, key: evaluation.key },
        ];
      }),
    );
  }, [defaultParameters, evaluations]);

  return useMemo(
    () =>
      ({
        aliases,
        order,
        setAlias: (alias: string, key: SandboxKey<'visualizer'>) => {
          handleAliasesChange({ ...aliases, [alias]: key });
        },
        appendAlias: (alias: string, key: SandboxKey<'visualizer'>) => {
          handleAliasesChange({ ...aliases, [alias]: key });
          handleOrderChange([...order, alias]);
        },
        removeAlias: (alias: string) => {
          const newAliases = { ...aliases };
          delete newAliases[alias];
          handleAliasesChange(newAliases);
          handleOrderChange(order.filter((o) => o !== alias));
        },
        instances,
        parameters: {
          default: parameters,
          value: parameters,
          setValue: (
            alias: string,
            value: ParsedParameters<SandboxParameters>,
          ) => {
            setParameters({ ...parameters, [alias]: value });
          },
        },
      }) satisfies BoxContextVisualizers,
    [
      aliases,
      order,
      instances,
      parameters,
      handleAliasesChange,
      handleOrderChange,
    ],
  );
}
