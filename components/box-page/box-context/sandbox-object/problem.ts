import { CatalogGroup } from '@constants/catalog';
import { DbProblemSaved } from '@utils/db';
import {
  useAddSavedProblemMutation,
  useRemoveSavedProblemMutation,
  useSavedProblemsQuery,
  useSetSavedProblemMutation,
} from '@utils/db/problems';

import {
  BoxContextSandboxObject,
  defaultBoxContextSandboxObject,
  useBoxContextSandboxObject,
} from '.';

export type BoxContextProblem = BoxContextSandboxObject<'problem'>;

export const defaultBoxContextProblem =
  defaultBoxContextSandboxObject as BoxContextProblem;

export default function useBoxContextProblem({
  builtInProblemOptions,
}: {
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
}) {
  return useBoxContextSandboxObject({
    type: 'problem',
    builtInOptions: builtInProblemOptions,
    addSavedObjectMutation: useAddSavedProblemMutation(),
    setSavedObjectMutation: useSetSavedProblemMutation(),
    removeSavedObjectMutation: useRemoveSavedProblemMutation(),
    savedObjects: useSavedProblemsQuery().data,
  }) as BoxContextProblem;
}
