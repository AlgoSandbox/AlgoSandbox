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
import { error, ErrorOr, success } from '@app/errors';
import { CatalogOption } from '@constants/catalog';
import { DbVisualizerSaved } from '@utils/db';
import evalSavedObject from '@utils/eval/evalSavedObject';
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
};

export default function useBoxContextVisualizers({
  defaultAliases,
  defaultOrder,
  onChange,
  options,
}: {
  options: Array<CatalogOption<DbVisualizerSaved>>;
  defaultOrder: Array<string>;
  defaultAliases: Record<
    string,
    SandboxKeyWithParameters<SandboxVisualizerKey>
  >;
  onChange: (newValue: {
    order: Array<string>;
    aliases: Record<string, SandboxKeyWithParameters<SandboxVisualizerKey>>;
  }) => void;
}) {
  const [aliases, setAliases] = useState(defaultAliases);
  const [order, setOrder] = useState(defaultOrder);

  useEffect(() => {
    setAliases(defaultAliases);
  }, [defaultAliases]);

  useEffect(() => {
    setOrder(defaultOrder);
  }, [defaultOrder]);

  const handleChange = useCallback(
    ({
      order: newOrder,
      aliases: newAliases,
    }: {
      order: Array<string>;
      aliases: Record<string, SandboxKeyWithParameters<SandboxVisualizerKey>>;
    }) => {
      setOrder(newOrder);
      setAliases(newAliases);
      onChange({ order: newOrder, aliases: newAliases });
    },
    [onChange],
  );

  const selectedVisualizers: Record<
    string,
    ErrorOr<CatalogOption<DbVisualizerSaved>>
  > = useMemo(() => {
    return mapValues(aliases, (keyWithParameters) => {
      const { key } = parseKeyWithParameters(keyWithParameters);
      const option = options.find((option) => option.value.key === key);

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
          handleChange({ order, aliases: { ...aliases, [alias]: key } });
        },
        appendAlias: (
          alias: string,
          key: SandboxKeyWithParameters<SandboxVisualizerKey>,
        ) => {
          handleChange({
            order: [...order, alias],
            aliases: { ...aliases, [alias]: key },
          });
        },
        removeAlias: (alias: string) => {
          const newAliases = { ...aliases };
          delete newAliases[alias];
          const newOrder = order.filter((o) => o !== alias);

          handleChange({ order: newOrder, aliases: newAliases });
        },
        instances,
        defaultParameters,
      }) satisfies BoxContextVisualizers,
    [aliases, order, instances, defaultParameters, handleChange],
  );
}
