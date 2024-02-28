import { error } from '@app/errors/ErrorContext';
import { useBoxContext } from '@components/box-page';
import ComponentSelect from '@components/box-page/app-bar/ComponentSelect';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
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
  const setAlgorithmVisualizers = useBoxContext('algorithmVisualizers.set');
  const algorithmVisualizersTree = useBoxContext('algorithmVisualizers.tree');
  const {
    default: defaultAll,
    setValue: setParameters,
    value: parametersAll,
  } = useBoxContext('algorithmVisualizers.evaluated.parameters');
  const evaluatedAdapters = useBoxContext(
    'algorithmVisualizers.evaluated.adapters',
  );

  const defaultParameters = useMemo(
    () => defaultAll[alias] ?? {},
    [alias, defaultAll],
  );

  const parameters = useMemo(
    () => parametersAll[alias] ?? {},
    [alias, parametersAll],
  );

  const adapterKey = useMemo(
    () => (algorithmVisualizersTree.adapters ?? {})[alias],
    [algorithmVisualizersTree.adapters, alias],
  );

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

        setAlgorithmVisualizers({
          adapters: {
            ...algorithmVisualizersTree.adapters,
            [alias]: value.key,
          },
          composition: {
            ...algorithmVisualizersTree.composition,
            connections:
              algorithmVisualizersTree.composition.connections.filter(
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
