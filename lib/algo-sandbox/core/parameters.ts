import { unknown } from 'zod';

export type Parameter<T = any> = {
  name: string;
  defaultValue: T;
};

export type Parameters<T = Record<string, unknown>> = Readonly<{
  [K in keyof T]: Parameter<T[K]>;
}>;

export type Parametered<T, P extends Parameters> = {
  name: string;
  parameters: P;
  create: (parameters: ParsedParameters<P>) => T;
};

export type ParsedParameter<P extends Parameter> = P extends Parameter<infer T>
  ? T
  : never;

export type ParsedParameters<P extends Parameters> = Readonly<{
  [K in keyof P]: ParsedParameter<P[K]>;
}>;

export namespace SandboxParam {
  export function integer(
    name: string,
    defaultValue: number
  ): Parameter<number> {
    return {
      name,
      defaultValue,
    };
  }

  export function callback<T extends Function>(
    name: string,
    defaultValue: T
  ): Parameter<T> {
    return {
      name,
      defaultValue: defaultValue as unknown as T,
    };
  }
}
