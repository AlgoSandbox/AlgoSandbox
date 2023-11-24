import { z } from 'zod';

import { SandboxStateType } from './state-names';

export type SandboxState<N extends SandboxStateType = SandboxStateType> =
  z.infer<N['shape']>;
