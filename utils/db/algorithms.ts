import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as LocalDb from './local/algorithms';
import { DbAlgorithm, DbAlgorithmSaved } from './types';

export function useSavedAlgorithmsQuery() {
  return useQuery(['objects', 'algorithm'], async () => {
    return LocalDb.getSavedAlgorithms();
  });
}

export function useAddSavedAlgorithmMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (algorithm: DbAlgorithm) => {
      1;
      return LocalDb.addSavedAlgorithm(algorithm);
    },
    {
      onSuccess: ({ type }) => {
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}

export function useSetSavedAlgorithmMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (algorithm: DbAlgorithmSaved) => {
      return LocalDb.setSavedAlgorithm(algorithm);
    },
    {
      onSuccess: ({ key, type }) => {
        queryClient.invalidateQueries(['objects', key]);
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}

export function useRemoveSavedAlgorithmMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (algorithm: DbAlgorithmSaved) => {
      LocalDb.removeSavedAlgorithm(algorithm);
    },
    {
      onSuccess: (_, { key, type }) => {
        queryClient.invalidateQueries(['objects', key]);
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}
