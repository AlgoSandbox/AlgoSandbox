type SandboxParameterTypeMap = {
  integer: number;
  callback: Function;
};

export type SandboxParameterType = keyof SandboxParameterTypeMap;

export type SandboxParameter<
  S extends SandboxParameterType = SandboxParameterType,
  T extends any = SandboxParameterTypeMap[S]
> = {
  name: string;
  type: S;
  defaultValue: T;
};

export type SandboxParameters<
  T = Record<string, SandboxParameterTypeMap[SandboxParameterType]>
> = Readonly<{
  [K in keyof T]: SandboxParameter<SandboxParameterType, T[K]>;
}>;

export type Parametered<T, P extends SandboxParameters> = {
  name: string;
  parameters: P;
  create: (parameters?: ParsedParameters<P>) => T;
};

export type ParsedParameter<P> = P extends SandboxParameter<any, infer T>
  ? T
  : never;

export type ParsedParameters<P extends SandboxParameters> = Readonly<{
  [K in keyof P]: ParsedParameter<P[K]>;
}>;

export namespace SandboxParam {
  export function integer(
    name: string,
    defaultValue: number
  ): SandboxParameter<'integer'> {
    return {
      name,
      type: 'integer',
      defaultValue,
    };
  }

  export function callback<T extends Function>(
    name: string,
    defaultValue: T
  ): SandboxParameter<'callback', T> {
    return {
      name,
      type: 'callback',
      defaultValue: defaultValue as unknown as T,
    };
  }
}

export function getDefaultParameters<P extends SandboxParameters>(
  parameters: P
): ParsedParameters<P> {
  return Object.fromEntries(
    Object.entries(parameters).map(([key, value]) => [key, value.defaultValue])
  ) as ParsedParameters<P>;
}
