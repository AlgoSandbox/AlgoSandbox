import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LocalDb } from './local/algorithms';
import { DbSandboxObject, DbSavedSandboxObject } from './types';

export function useSavedAlgorithmsQuery() {
  return useQuery(['algorithms'], async () => {
    return LocalDb.getSavedAlgorithms();
  });
}

export function useAddSavedAlgorithmMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (algorithm: DbSandboxObject) => {
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
    async (algorithm: DbSavedSandboxObject) => {
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
    async (algorithm: DbSavedSandboxObject) => {
      LocalDb.removeSavedAlgorithm(algorithm);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['algorithms']);
      },
    }
  );
}
