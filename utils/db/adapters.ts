import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as LocalDb from './local/adapters';
import { DbAdapter, DbAdapterSaved } from './types';

export function useSavedAdaptersQuery() {
  return useQuery(['objects', 'adapter'], async () => {
    return LocalDb.getSavedAdapters();
  });
}

export function useAddSavedAdapterMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (adapter: DbAdapter) => {
      return LocalDb.addSavedAdapter(adapter);
    },
    {
      onSuccess: ({ type }) => {
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}

export function useSetSavedAdapterMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (adapter: DbAdapterSaved) => {
      return LocalDb.setSavedAdapter(adapter);
    },
    {
      onSuccess: ({ key, type }) => {
        queryClient.invalidateQueries(['objects', key]);
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}

export function useRemoveSavedAdapterMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (adapter: DbAdapterSaved) => {
      LocalDb.removeSavedAdapter(adapter);
    },
    {
      onSuccess: (_, { key, type }) => {
        queryClient.invalidateQueries(['objects', key]);
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}
