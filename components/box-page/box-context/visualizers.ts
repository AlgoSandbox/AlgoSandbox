import { SandboxKey } from '@algo-sandbox/components/SandboxKey';
import {
  getDefaultParameters,
  ParsedParameters,
  SandboxEvaluated,
  SandboxParameters,
  SandboxStateType,
  SandboxVisualizer,
} from '@algo-sandbox/core';
import { error, ErrorOr, success } from '@app/errors/ErrorContext';
import { CatalogGroup, CatalogOption } from '@constants/catalog';
import { DbVisualizerSaved } from '@utils/db';
import { evalSavedObject } from '@utils/evalSavedObject';
import { mapValues } from 'lodash';
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
    ErrorOr<SandboxEvaluated<SandboxVisualizer<SandboxStateType, unknown>>>
  >;
  reset: () => void;
};

export default function useBoxContextVisualizers({
  defaultAliases,
  defaultOrder,
  onOrderChange,
  onAliasesChange,
  options,
}: {
  options: Array<CatalogGroup<DbVisualizerSaved>>;
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

  const selectedVisualizers: Record<
    string,
    ErrorOr<CatalogOption<DbVisualizerSaved>>
  > = useMemo(() => {
    return mapValues(
      aliases, (key) => {
        const option = options
          .flatMap((group) => group.options)
          .find((option) => option.value.key === key);

        if (option === undefined) {
          return error(`Visualizer ${key} not found`) as ErrorOr<CatalogOption<DbVisualizerSaved>>;
        }

        return success(option);
      })
  }, [aliases, options]);

  const evaluations = useMemo(() => {
    return mapValues(selectedVisualizers, (option) => {
      return option.chain((visualizer) => {
        const visualizerEvaluation = evalSavedObject<'visualizer'>(
          visualizer.value,
        );

        return visualizerEvaluation.map((value) => ({
          value,
          name: visualizer.label,
          key: visualizer.value.key,
        }));
      });
    });
  }, [selectedVisualizers]);

  const defaultParameters = useMemo(() => {
    return mapValues(evaluations, (evaluation) => {
      return evaluation.map(({ value: visualizer }) => {
        const defaultParams =
          'parameters' in visualizer
            ? getDefaultParameters(visualizer.parameters)
            : null;

        return defaultParams;
      });
    });
  }, [evaluations]);

  const instances = useMemo(() => {
    return mapValues(evaluations, (evaluation, alias) => {
      return evaluation.chain(({ value: visualizer, name, key }) => {
        return defaultParameters[alias].map((parameters) => {
          const instance =
            'parameters' in visualizer
              ? visualizer.create(parameters ?? {})
              : visualizer;

          return { value: instance, name, key };
        });
      });
    });
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
        reset: () => {
          setAliases(defaultAliases);
          setOrder(defaultOrder);
        },
      }) satisfies BoxContextVisualizers,
    [
      aliases,
      order,
      instances,
      parameters,
      handleAliasesChange,
      handleOrderChange,
      defaultAliases,
      defaultOrder,
    ],
  );
}
