import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as LocalDb from './local/problems';
import { DbProblem, DbProblemSaved } from './types';

export function useSavedProblemsQuery() {
  return useQuery(['objects', 'problem'], async () => {
    return LocalDb.getSavedProblems();
  });
}

export function useAddSavedProblemMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (problem: DbProblem) => {
      return LocalDb.addSavedProblem(problem);
    },
    {
      onSuccess: ({ type }) => {
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}

export function useSetSavedProblemMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (problem: DbProblemSaved) => {
      return LocalDb.setSavedProblem(problem);
    },
    {
      onSuccess: ({ key, type }) => {
        queryClient.invalidateQueries(['objects', key]);
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}

export function useRemoveSavedProblemMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (problem: DbProblemSaved) => {
      LocalDb.removeSavedProblem(problem);
    },
    {
      onSuccess: (_, { key, type }) => {
        queryClient.invalidateQueries(['objects', key]);
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}
