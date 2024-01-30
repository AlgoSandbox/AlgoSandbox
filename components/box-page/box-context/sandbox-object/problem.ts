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
  builtInProblemOptions,
  defaultKey,
  onKeyChange,
}: {
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
  defaultKey: SandboxKey<'problem'> | undefined;
  onKeyChange: (key: SandboxKey<'problem'>) => void;
}) {
  return useBoxContextSandboxObject({
    type: 'problem',
    builtInOptions: builtInProblemOptions,
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
