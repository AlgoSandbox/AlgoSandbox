import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DbSandboxObject } from '.';
import * as LocalDb from './local';

export function useSavedObjectQuery(key: string) {
  return useQuery(['objects', key], async () => {
    return LocalDb.getSandboxObject(key);
  });
}

export function useSaveObjectMutation() {
  const queryClient = useQueryClient();

  return useMutation(
    async (sandboxObject: DbSandboxObject) => {
      return LocalDb.saveSandboxObject(sandboxObject);
    },
    {
      onSuccess: (_, { key, type }) => {
        queryClient.invalidateQueries(['objects', key]);
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}
