export type SandboxParameterTypeMap = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (...args: Array<any>) => any;
  color: string;
  float: number;
  integer: number;
  string: string;
  graph: string;
  grid: string;
};

export type SandboxParameterType = keyof SandboxParameterTypeMap;

export type SandboxParameter<
  S extends SandboxParameterType = SandboxParameterType,
  T = SandboxParameterTypeMap[S],
> = {
  name: string;
  type: S;
  defaultValue: T;
  validate?: (value: T) => boolean | string;
};

export type SandboxParameters<
  T extends Record<
    string,
    SandboxParameterTypeMap[SandboxParameterType]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  > = Record<string, any>,
> = Readonly<{
  [K in keyof T]: SandboxParameter<SandboxParameterType, T[K]>;
}>;

export type Parameterized<T, P extends SandboxParameters> = {
  name: string;
  parameters: P;
  create: (parameters?: ParsedParameters<P>) => T;
};

export type ParsedParameter<P> = P extends SandboxParameter<
  SandboxParameterType,
  infer T
>
  ? T
  : never;

export type ParsedParameters<P extends SandboxParameters> = Readonly<{
  [K in keyof P]: ParsedParameter<P[K]>;
}>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function callback<T extends (...args: Array<any>) => any>(
  name: string,
  defaultValue: T,
  validate?: (value: SandboxParameterTypeMap['callback']) => boolean | string,
): SandboxParameter<'callback', T> {
  return {
    name,
    type: 'callback',
    defaultValue: defaultValue as unknown as T,
    validate,
  };
}

export function color(
  name: string,
  defaultValue: string,
  validate?: (value: SandboxParameterTypeMap['color']) => boolean | string,
): SandboxParameter<'color'> {
  return {
    name,
    type: 'color',
    defaultValue,
    validate,
  };
}

export function float(
  name: string,
  defaultValue: number,
  validate?: (value: SandboxParameterTypeMap['float']) => boolean | string,
): SandboxParameter<'float'> {
  return {
    name,
    type: 'float',
    defaultValue,
    validate,
  };
}

export function integer(
  name: string,
  defaultValue: number,
  validate?: (value: SandboxParameterTypeMap['integer']) => boolean | string,
): SandboxParameter<'integer'> {
  return {
    name,
    type: 'integer',
    defaultValue,
    validate,
  };
}

export function string(
  name: string,
  defaultValue: string,
  validate?: (value: string) => string | boolean,
): SandboxParameter<'string'> {
  return {
    name,
    type: 'string',
    defaultValue,
    validate,
  };
}

export function graph(
  name: string,
  defaultValue: string,
  validate?: (value: string) => string | boolean,
): SandboxParameter<'graph'> {
  return {
    name,
    type: 'graph',
    defaultValue,
    validate,
  };
}

export function grid(
  name: string,
  defaultValue: string,
  validate?: (value: string) => string | boolean,
): SandboxParameter<'grid'> {
  return {
    name,
    type: 'grid',
    defaultValue,
    validate,
  };
}

export function getDefaultParameters<P extends SandboxParameters>(
  parameters: P,
): ParsedParameters<P> {
  return Object.fromEntries(
    Object.entries(parameters).map(([key, value]) => [key, value.defaultValue]),
  ) as ParsedParameters<P>;
}

export const SandboxParam = {
  callback,
  color,
  float,
  integer,
  string,
  graph,
  grid,
};
