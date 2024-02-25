import { SandboxKey } from '@algo-sandbox/components/SandboxKey';
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
  options,
  defaultKey,
  onKeyChange,
}: {
  options: Array<CatalogGroup<DbProblemSaved>>;
  defaultKey: SandboxKey<'problem'> | undefined;
  onKeyChange: (key: SandboxKey<'problem'>) => void;
}) {
  return useBoxContextSandboxObject({
    type: 'problem',
    options,
    addSavedObjectMutation: useAddSavedProblemMutation(),
    setSavedObjectMutation: useSetSavedProblemMutation(),
    removeSavedObjectMutation: useRemoveSavedProblemMutation(),
    savedObjects: useSavedProblemsQuery().data,
    defaultKey,
    onSelect: ({ key }) => {
      onKeyChange(key);
    },
  }) as BoxContextProblem;
}
