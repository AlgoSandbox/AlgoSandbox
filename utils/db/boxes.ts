import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as LocalDb from './local/boxes';
import { DbBox, DbBoxSaved } from './types';

export function useSavedBoxesQuery() {
  return useQuery(['objects', 'box'], async () => {
    return LocalDb.getSavedBoxes();
  });
}

export function useAddSavedBoxMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (box: DbBox) => {
      1;
      return LocalDb.addSavedBox(box);
    },
    {
      onSuccess: ({ type }) => {
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}

export function useSetSavedBoxMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (box: DbBoxSaved) => {
      return LocalDb.setSavedBox(box);
    },
    {
      onSuccess: ({ key, type }) => {
        queryClient.invalidateQueries(['objects', key]);
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}

export function useRemoveSavedBoxMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (box: DbBoxSaved) => {
      LocalDb.removeSavedBox(box);
    },
    {
      onSuccess: (_, { key, type }) => {
        queryClient.invalidateQueries(['objects', key]);
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}
