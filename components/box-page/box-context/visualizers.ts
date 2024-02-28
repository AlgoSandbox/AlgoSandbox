import { SandboxVisualizerKey } from '@algo-sandbox/components/SandboxKey';
import {
  getDefaultParameters,
  ParsedParameters,
  SandboxEvaluated,
  SandboxKeyWithParameters,
  SandboxParameters,
  SandboxStateType,
  SandboxVisualizer,
} from '@algo-sandbox/core';
import { error, ErrorOr, success } from '@app/errors/ErrorContext';
import { CatalogGroup, CatalogOption } from '@constants/catalog';
import { DbVisualizerSaved } from '@utils/db';
import { evalSavedObject } from '@utils/evalSavedObject';
import parseKeyWithParameters from '@utils/parseKeyWithParameters';
import { mapValues } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type BoxContextVisualizers = {
  aliases: Record<string, SandboxKeyWithParameters<SandboxVisualizerKey>>;
  order: Array<string>;
  setAlias: (
    alias: string,
    key: SandboxKeyWithParameters<SandboxVisualizerKey>,
  ) => void;
  defaultParameters: Record<string, ParsedParameters<SandboxParameters> | null>;
  appendAlias: (
    alias: string,
    key: SandboxKeyWithParameters<SandboxVisualizerKey>,
  ) => void;
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
  defaultAliases: Record<
    string,
    SandboxKeyWithParameters<SandboxVisualizerKey>
  >;
  onOrderChange: (order: Array<string>) => void;
  onAliasesChange: (
    aliases: Record<string, SandboxKeyWithParameters<SandboxVisualizerKey>>,
  ) => void;
}) {
  const [aliases, setAliases] = useState(defaultAliases);
  const [order, setOrder] = useState(defaultOrder);

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
    (
      newAliases: Record<
        string,
        SandboxKeyWithParameters<SandboxVisualizerKey>
      >,
    ) => {
      setAliases(newAliases);
      onAliasesChange(newAliases);
    },
    [onAliasesChange],
  );

  const selectedVisualizers: Record<
    string,
    ErrorOr<CatalogOption<DbVisualizerSaved>>
  > = useMemo(() => {
    return mapValues(aliases, (keyWithParameters) => {
      const { key } = parseKeyWithParameters(keyWithParameters);
      const option = options
        .flatMap((group) => group.options)
        .find((option) => option.value.key === key);

      if (option === undefined) {
        return error(`Visualizer ${key} not found`) as ErrorOr<
          CatalogOption<DbVisualizerSaved>
        >;
      }

      return success(option);
    });
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
      return evaluation
        .map(({ value: visualizer }) => {
          const defaultParams =
            'parameters' in visualizer
              ? getDefaultParameters(visualizer.parameters)
              : null;

          return defaultParams;
        })
        .mapLeft(() => null).value;
    });
  }, [evaluations]);

  const parameters = useMemo(() => {
    return mapValues(aliases, (keyWithParameters) => {
      const { parameters } = parseKeyWithParameters(keyWithParameters);

      return parameters;
    });
  }, [aliases]);

  const instances = useMemo(() => {
    return mapValues(evaluations, (evaluation, alias) => {
      return evaluation.map(({ value: visualizer, name, key }) => {
        const params = parameters[alias] ?? defaultParameters[alias];
        const instance =
          'parameters' in visualizer
            ? visualizer.create(params ?? {})
            : visualizer;

        return { value: instance, name, key };
      });
    });
  }, [defaultParameters, evaluations, parameters]);

  return useMemo(
    () =>
      ({
        aliases,
        order,
        setAlias: (
          alias: string,
          key: SandboxKeyWithParameters<SandboxVisualizerKey>,
        ) => {
          handleAliasesChange({ ...aliases, [alias]: key });
        },
        appendAlias: (
          alias: string,
          key: SandboxKeyWithParameters<SandboxVisualizerKey>,
        ) => {
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
        defaultParameters,
        reset: () => {
          setAliases(defaultAliases);
          setOrder(defaultOrder);
        },
      }) satisfies BoxContextVisualizers,
    [
      aliases,
      order,
      instances,
      defaultParameters,
      handleAliasesChange,
      handleOrderChange,
      defaultAliases,
      defaultOrder,
    ],
  );
}
