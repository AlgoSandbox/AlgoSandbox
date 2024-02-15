import { isEqual } from 'lodash';

import { SandboxState, SandboxStateType } from '../state';

export type SandboxAdapter<
  N extends SandboxStateType,
  M extends SandboxStateType,
> = {
  accepts: N;
  outputs: M;
  transform: (value: SandboxState<N>) => SandboxState<M>;
};

export type SandboxCompositeAdapter<
  N extends SandboxStateType,
  M extends SandboxStateType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  A extends Array<SandboxAdapter<any, any>> = SandboxCompositeAdapters<N, M>,
> = SandboxAdapter<N, M> & {
  adapters: A;
};

type SandboxCompositeAdapters<
  N extends SandboxStateType,
  M extends SandboxStateType,
> =
  | [SandboxAdapter<N, M>]
  | [
      SandboxAdapter<N, SandboxStateType>,
      ...Array<SandboxAdapter<SandboxStateType, SandboxStateType>>,
      SandboxAdapter<SandboxStateType, M>,
    ];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Input<T> = T extends SandboxAdapter<infer U, any> ? U : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Output<T> = T extends SandboxAdapter<any, infer U> ? U : never;

type ValidCompose<A1, A2> = Output<A1> extends Input<A2>
  ? A1
  : SandboxAdapter<Input<A1>, Input<A2>>;
type ValidPipe<A> = A extends [infer A1, infer A2, ...infer Rest]
  ? [ValidCompose<A1, A2>, ...ValidPipe<[A2, ...Rest]>]
  : A;
type Last<A> = A extends [...unknown[], infer T] ? T : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function compose<A extends Array<SandboxAdapter<any, any>>>(
  ...adapters: ValidPipe<A>
): SandboxCompositeAdapter<Input<A[0]>, Output<Last<A>>, ValidPipe<A>> {
  return {
    accepts: adapters[0].accepts,
    outputs: adapters[adapters.length - 1].outputs as Output<Last<A>>,
    adapters,
    transform: (value) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return adapters.reduce<SandboxState<any>>(
        (val, adapter) => adapter.transform(val),
        value,
      );
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function tryCompose<A extends Array<SandboxAdapter<any, any>>>(
  ...adapters: ValidPipe<A>
): SandboxCompositeAdapter<Input<A[0]>, Output<Last<A>>, ValidPipe<A>> | null {
  for (let i = 0; i < adapters.length - 1; i++) {
    const first = adapters[i] as SandboxAdapter<
      SandboxStateType,
      SandboxStateType
    >;
    const second = adapters[i + 1] as SandboxAdapter<
      SandboxStateType,
      SandboxStateType
    >;
    if (
      !isEqual(
        Object.keys(first.outputs.shape.shape),
        Object.keys(second.accepts.shape.shape),
      )
    ) {
      return null;
    }
  }

  return compose(...adapters);
}
