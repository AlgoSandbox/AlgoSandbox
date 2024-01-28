export type RecursivePath<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${'' | `.${RecursivePath<T[K]>}`}`;
    }[keyof T]
  : never;

export type Get<
  T extends Record<string, unknown>,
  P,
> = P extends `${infer K}.${infer Rest}`
  ? T[K] extends Record<string, unknown>
    ? Get<T[K], Rest>
    : never
  : P extends keyof T
  ? T[P]
  : never;
