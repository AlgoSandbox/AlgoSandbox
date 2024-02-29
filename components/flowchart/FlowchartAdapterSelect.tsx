import { error } from '@app/errors/ErrorContext';
import { useBoxContext } from '@components/box-page';
import ComponentSelect from '@components/box-page/app-bar/ComponentSelect';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
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
  const { adapterOptions: options } = useSandboxComponents();
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
    const flattenedOptions = options.flatMap((item) =>
      'options' in item ? item.options : item,
    );
    return flattenedOptions.find((option) => option.key === adapterKey)!;
  }, [options, adapterKey]);

  return (
    <ComponentSelect<'adapter'>
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
            [alias]: value.key,
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
