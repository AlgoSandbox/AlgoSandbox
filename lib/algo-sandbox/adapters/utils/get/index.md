# Get at path

Gets the value at `path` of the input `object`.

`path` is a dot-separated key to the desired variable. For example, to get `object.a.b`, the `path` would be `'a.b'`.

`path` also supports a special `*` wildcard value which represents any key. This is useful for mapping array/object values.

For example, we have the given input object:

```ts
const object = [
  items: [
    { name: 'object1' },
    { name: 'object2' }
  ]
]
```

To get `['object1', 'object2']`, we can use the `path` = `items.*.name`.
