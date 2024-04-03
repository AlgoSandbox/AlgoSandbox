import { SandboxKey } from '@algo-sandbox/components/SandboxKey';
import { CatalogOption } from '@constants/catalog';
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
  key,
  onChange,
  parameters,
}: {
  options: Array<CatalogOption<DbProblemSaved>>;
  key: SandboxKey<'problem'> | null;
  onChange: (
    key: SandboxKey<'problem'> | null,
    parameters: Record<string, unknown> | null,
  ) => void;
  parameters: Record<string, unknown> | null;
}) {
  return useBoxContextSandboxObject({
    type: 'problem',
    options,
    addSavedObjectMutation: useAddSavedProblemMutation(),
    setSavedObjectMutation: useSetSavedProblemMutation(),
    removeSavedObjectMutation: useRemoveSavedProblemMutation(),
    savedObjects: useSavedProblemsQuery().data,
    key,
    onChange,
    parameters,
  }) as BoxContextProblem;
}
