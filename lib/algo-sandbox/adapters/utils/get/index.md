# Get at path

Gets the value at `path` of `object`.

This supports `*` syntax for arrays/objects.

Example:

```ts
// e.g. customGet({ a: { b: [1, 2, 3] } }, 'a.b') => [1, 2, 3]
// e.g. customGet([{b: 2}, {b: 3}], '*.b') => [2, 3]
```
