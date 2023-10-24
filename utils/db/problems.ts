import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as LocalDb from './local/problems';
import { DbProblem, DbProblemSaved } from './types';

export function useSavedProblemsQuery() {
  return useQuery(['problems'], async () => {
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
      onSuccess: () => {
        queryClient.invalidateQueries(['problems']);
      },
    }
  );
}

export function useSetSavedProblemMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (problem: DbProblemSaved) => {
      return LocalDb.setSavedProblem(problem);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['problems']);
      },
    }
  );
}

export function useRemoveSavedProblemMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (problem: DbProblemSaved) => {
      LocalDb.removeSavedProblem(problem);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['problems']);
      },
    }
  );
}
