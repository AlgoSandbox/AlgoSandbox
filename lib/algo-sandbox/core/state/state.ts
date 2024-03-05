import { z } from 'zod';

import { SandboxNullableStateType } from './state-names';

export type SandboxState<
  N extends SandboxNullableStateType = SandboxNullableStateType,
> = z.infer<N['shape']>;
