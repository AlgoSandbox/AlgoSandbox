import { AdapterListPopover, useBoxContext } from '@components/box-page';
import { Button, MaterialSymbol } from '@components/ui';
import parseKeyWithParameters from '@utils/parseKeyWithParameters';
import clsx from 'clsx';
import { mapValues } from 'lodash';
import { useMemo } from 'react';

export default function ProblemAlgorithmAdapterSelect() {
  const { instance: problemEvaluation } = useBoxContext('problem');
  const { instance: algorithmEvaluation } = useBoxContext('algorithm');
  const {
    compatible,
    adapters: { options, selectedOptions, config, setConfig, evaluations },
  } = useBoxContext('problemAlgorithm');

  const problemInstance = problemEvaluation.mapLeft(() => null).value;
  const algorithmInstance = algorithmEvaluation.mapLeft(() => null).value;

  const inputConfig = useMemo(() => {
    return {
      adapters: selectedOptions,
      order: config.composition.order,
      parameters: mapValues(config.aliases, (keyWithParameters) => {
        const { parameters } = parseKeyWithParameters(keyWithParameters);
        return parameters;
      }),
    };
  }, [config.aliases, config.composition.order, selectedOptions]);

  return (
    <AdapterListPopover
      fromLabel="Problem"
      toLabel="Algorithm"
      fromType={problemInstance?.type ?? null}
      toType={algorithmInstance?.accepts ?? null}
      config={inputConfig}
      evaluations={evaluations}
      onConfigChange={(config) => {
        setConfig({
          aliases: mapValues(config.adapters, (adapter, alias) => {
            const params = config.parameters[alias];
            if (params !== undefined) {
              return {
                key: adapter.key,
                parameters: params,
              };
            }

            return adapter.key;
          }),
          composition: {
            type: 'flat',
            order: config.order,
          },
        });
      }}
      options={options}
    >
      <Button
        variant="flat"
        label="Select adapter"
        hideLabel
        className="group"
        icon={
          <MaterialSymbol
            icon="keyboard_double_arrow_right"
            className={clsx(
              'group-aria-expanded:rotate-90 transition',
              compatible && 'text-primary',
              !compatible && 'text-danger',
            )}
          />
        }
      />
    </AdapterListPopover>
  );
}
