import { error } from '@app/errors';
import { useBoxContext } from '@components/box-page';
import FlowchartComponentSelect from '@components/flowchart/FlowchartComponentSelect';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import groupOptionsByTag from '@utils/groupOptionsByTag';
import parseKeyWithParameters from '@utils/parseKeyWithParameters';
import { useMemo } from 'react';

export default function FlowchartAdapterSelect({
  className,
  label,
  alias,
}: {
  label: string;
  alias: string;
  className?: string;
}) {
  const { adapterOptions } = useSandboxComponents();
  const options = useMemo(() => {
    return groupOptionsByTag(adapterOptions);
  }, [adapterOptions]);
  const setConfig = useBoxContext('config.set');
  const configTree = useBoxContext('config.tree');
  const {
    default: defaultAll,
    setValue: setParameters,
    value: parametersAll,
  } = useBoxContext('config.evaluated.parameters');
  const evaluatedAdapters = useBoxContext('config.evaluated.adapters');

  const defaultParameters = useMemo(
    () => defaultAll[alias] ?? {},
    [alias, defaultAll],
  );

  const parameters = useMemo(
    () => parametersAll[alias] ?? {},
    [alias, parametersAll],
  );

  const adapterKey = useMemo(() => {
    const keyWithParameters = (configTree.adapters ?? {})[alias];
    const { key } = parseKeyWithParameters(keyWithParameters);

    return key;
  }, [configTree.adapters, alias]);

  const adapterEvaluation =
    evaluatedAdapters[alias]?.map(({ value }) => value) ??
    error('Adapter evaluation not found');

  const value = useMemo(() => {
    return adapterOptions.find((option) => option.key === adapterKey)!;
  }, [adapterOptions, adapterKey]);

  return (
    <FlowchartComponentSelect<'adapter'>
      className={className}
      label={label}
      hideLabel={true}
      hideErrors={true}
      value={value}
      onChange={(value) => {
        if (value === null) {
          return;
        }

        setConfig({
          adapters: {
            ...configTree.adapters,
            [alias]: value.value.key,
          },
          composition: {
            ...configTree.composition,
            connections: configTree.composition.connections.filter(
              ({ fromKey, toKey }) => fromKey !== alias && toKey !== alias,
            ),
          },
        });
      }}
      options={options}
      evaluatedValue={adapterEvaluation}
      defaultParameters={defaultParameters}
      setParameters={(params) => {
        setParameters(alias, params);
      }}
      parameters={parameters}
    />
  );
}
