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
  key,
  onKeyChange,
  parameters,
  onParametersChange,
}: {
  options: Array<CatalogGroup<DbProblemSaved>>;
  key: SandboxKey<'problem'> | null;
  onKeyChange: (key: SandboxKey<'problem'> | null) => void;
  parameters: Record<string, unknown> | null;
  onParametersChange: (parameters: Record<string, unknown> | null) => void;
}) {
  return useBoxContextSandboxObject({
    type: 'problem',
    options,
    addSavedObjectMutation: useAddSavedProblemMutation(),
    setSavedObjectMutation: useSetSavedProblemMutation(),
    removeSavedObjectMutation: useRemoveSavedProblemMutation(),
    savedObjects: useSavedProblemsQuery().data,
    key,
    onKeyChange,
    parameters,
    onParametersChange,
  }) as BoxContextProblem;
}
