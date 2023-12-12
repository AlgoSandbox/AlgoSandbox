import { Button } from '@components/ui';

import { useBoxContext } from '..';
import AlgorithmSelect from './AlgorithmSelect';
import AlgorithmVisualizerAdapterSelect from './AlgorithmVisualizerAdapterSelect';
import ProblemAlgorithmAdapterSelect from './ProblemAlgorithmAdapterSelect';
import ProblemSelect from './ProblemSelect';
import VisualizerSelect from './VisualizerSelect';

export default function AppBar() {
  const { setValue: setMode } = useBoxContext('mode');

  return (
    <header className="flex justify-start items-center px-4 border-b py-2 border-slate-300 gap-8">
      <span className="font-mono">
        algo
        <span className="text-white bg-primary-700 border px-1 rounded">
          sandbox
        </span>
      </span>
      <div className="flex flex-row items-end gap-2">
        <ProblemSelect />
        <ProblemAlgorithmAdapterSelect />
        <AlgorithmSelect />
        <AlgorithmVisualizerAdapterSelect />
        <VisualizerSelect />
        <Button
          label="Customize in editor modes"
          variant="primary"
          onClick={() => {
            setMode('editor');
          }}
        />
      </div>
    </header>
  );
}
