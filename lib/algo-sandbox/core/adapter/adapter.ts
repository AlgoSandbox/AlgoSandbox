import { SandboxState, SandboxStateName } from '../state';

export type SandboxAdapter<
  N extends SandboxStateName,
  M extends SandboxStateName
> = {
  accepts: N;
  outputs: M;
  transform: (value: SandboxState<N>) => SandboxState<M>;
};

export type SandboxCompositeAdapter<
  N extends SandboxStateName,
  M extends SandboxStateName,
  A extends Array<SandboxAdapter<any, any>> = SandboxCompositeAdapters<N, M>
> = SandboxAdapter<N, M> & {
  adapters: A;
};

type SandboxCompositeAdapters<
  N extends SandboxStateName,
  M extends SandboxStateName
> =
  | [SandboxAdapter<N, M>]
  | [
      SandboxAdapter<N, SandboxStateName>,
      ...Array<SandboxAdapter<SandboxStateName, SandboxStateName>>,
      SandboxAdapter<SandboxStateName, M>
    ];

export namespace SandboxAdapter {
  type Input<T> = T extends SandboxAdapter<infer U, any> ? U : never;
  type Output<T> = T extends SandboxAdapter<any, infer U> ? U : never;

  type ValidCompose<A1, A2> = Output<A1> extends Input<A2>
    ? A1
    : SandboxAdapter<Input<A1>, Input<A2>>;
  type ValidPipe<A> = A extends [infer A1, infer A2, ...infer Rest]
    ? [ValidCompose<A1, A2>, ...ValidPipe<[A2, ...Rest]>]
    : A;
  type Last<A> = A extends [...unknown[], infer T] ? T : never;

  export function compose<A extends Array<SandboxAdapter<any, any>>>(
    ...adapters: ValidPipe<A>
  ): SandboxCompositeAdapter<Input<A[0]>, Output<Last<A>>, ValidPipe<A>> {
    return {
      accepts: adapters[0].accepts,
      outputs: adapters[adapters.length - 1].outputs as Output<Last<A>>,
      adapters,
      transform: (value) => {
        return adapters.reduce<SandboxState<any>>(
          (val, adapter) => adapter.transform(val),
          value
        );
      },
    };
  }

  export function tryCompose<A extends Array<SandboxAdapter<any, any>>>(
    ...adapters: ValidPipe<A>
  ): SandboxCompositeAdapter<
    Input<A[0]>,
    Output<Last<A>>,
    ValidPipe<A>
  > | null {
    for (let i = 0; i < adapters.length - 1; i++) {
      const first = adapters[i];
      const second = adapters[i + 1];
      if (first.outputs !== second.accepts) {
        return null;
      }
    }

    return compose(...adapters);
  }
}
