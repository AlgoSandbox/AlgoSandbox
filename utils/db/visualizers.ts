import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as LocalDb from './local/visualizers';
import { DbVisualizer, DbVisualizerSaved } from './types';

export function useSavedVisualizersQuery() {
  return useQuery(['visualizers'], async () => {
    return LocalDb.getSavedVisualizers();
  });
}

export function useAddSavedVisualizerMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (visualizer: DbVisualizer) => {
      return LocalDb.addSavedVisualizer(visualizer);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['visualizers']);
      },
    }
  );
}

export function useSetSavedVisualizerMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (visualizer: DbVisualizerSaved) => {
      return LocalDb.setSavedVisualizer(visualizer);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['visualizers']);
      },
    }
  );
}

export function useRemoveSavedVisualizerMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (visualizer: DbVisualizerSaved) => {
      LocalDb.removeSavedVisualizer(visualizer);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['visualizers']);
      },
    }
  );
}
