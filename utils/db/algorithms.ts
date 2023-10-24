import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as LocalDb from './local/algorithms';
import { DbAlgorithm, DbAlgorithmSaved } from './types';

export function useSavedAlgorithmsQuery() {
  return useQuery(['algorithms'], async () => {
    return LocalDb.getSavedAlgorithms();
  });
}

export function useAddSavedAlgorithmMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (algorithm: DbAlgorithm) => {
      return LocalDb.addSavedAlgorithm(algorithm);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['algorithms']);
      },
    }
  );
}

export function useSetSavedAlgorithmMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (algorithm: DbAlgorithmSaved) => {
      return LocalDb.setSavedAlgorithm(algorithm);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['algorithms']);
      },
    }
  );
}

export function useRemoveSavedAlgorithmMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (algorithm: DbAlgorithmSaved) => {
      LocalDb.removeSavedAlgorithm(algorithm);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['algorithms']);
      },
    }
  );
}
