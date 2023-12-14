import { DbVisualizer, DbVisualizerSaved } from '..';
import { saveSandboxObject } from '.';

const savedListKey = 'sandbox:visualizers:custom';

function getSavedVisualizerKeys() {
  const savedVisualizerKeysRaw = localStorage.getItem(savedListKey);

  if (savedVisualizerKeysRaw === null) {
    return [];
  }

  return JSON.parse(savedVisualizerKeysRaw) as Array<string>;
}

export function getSavedVisualizers() {
  const savedVisualizerKeys = getSavedVisualizerKeys();

  return savedVisualizerKeys
    .map((key) => localStorage.getItem(key))
    .filter((item) => item !== null)
    .map((item) => JSON.parse(item!)) as Array<DbVisualizerSaved>;
}

export function addSavedVisualizer(visualizer: DbVisualizer) {
  const savedVisualizer = saveSandboxObject(visualizer);
  const visualizerKeys = getSavedVisualizerKeys();
  const newVisualizerKeys = [...visualizerKeys, savedVisualizer.key];
  localStorage.setItem(savedListKey, JSON.stringify(newVisualizerKeys));

  return savedVisualizer;
}

export function setSavedVisualizer(visualizer: DbVisualizerSaved) {
  const savedVisualizer = saveSandboxObject(visualizer);

  return savedVisualizer;
}

export function removeSavedVisualizer(visualizer: DbVisualizerSaved) {
  localStorage.removeItem(visualizer.key);

  const visualizerKeys = getSavedVisualizerKeys();
  const newVisualizerKeys = visualizerKeys.filter(
    (key) => key !== visualizer.key,
  );
  localStorage.setItem(savedListKey, JSON.stringify(newVisualizerKeys));
}
