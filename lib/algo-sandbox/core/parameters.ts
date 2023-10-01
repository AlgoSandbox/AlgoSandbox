export type SandboxParameter<T = any> = {
  name: string;
  defaultValue: T;
};

export type SandboxParameters = Readonly<
  Record<string, SandboxParameter<unknown>>
>;

export type ParsedParameter<P extends SandboxParameter> =
  P extends SandboxParameter<infer T> ? T : never;

export type ParsedParameters<P extends SandboxParameters> = Readonly<{
  [K in keyof P]: ParsedParameter<P[K]>;
}>;

export namespace SandboxParam {
  export function integer(
    name: string,
    defaultValue: number
  ): SandboxParameter<number> {
    return {
      name,
      defaultValue,
    };
  }
}
