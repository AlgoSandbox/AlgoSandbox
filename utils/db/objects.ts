import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { DbSandboxObject, DbSandboxObjectSaved, DbSandboxObjectType } from '.';
import * as LocalDb from './local';

export function useSavedObjectQuery<T extends DbSandboxObjectType>(
  key: string | null,
) {
  return useQuery(['objects', key], async () => {
    if (key === null) {
      return null;
    }
    return LocalDb.getSandboxObject<T>(key);
  });
}

export function useSavedObjectsQuery<T extends DbSandboxObjectType>(
  keys: Array<string>,
) {
  return useQueries({
    queries: keys.map((key) => ({
      queryKey: ['objects', key],
      queryFn: async () => {
        return LocalDb.getSandboxObject<T>(key);
      },
    })),
  });
}

export function useSaveObjectMutation<T extends DbSandboxObjectType>() {
  const queryClient = useQueryClient();

  return useMutation(
    async (sandboxObject: DbSandboxObject<T>) => {
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

export function useDeleteObjectMutation<T extends DbSandboxObjectType>() {
  const queryClient = useQueryClient();

  return useMutation(
    async (sandboxObject: DbSandboxObjectSaved<T>) => {
      return LocalDb.deleteSandboxObject(sandboxObject);
    },
    {
      onSuccess: (_, { key, type }) => {
        queryClient.invalidateQueries(['objects', key]);
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}
