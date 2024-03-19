export default function evalWithContext(
  code: string,
  context: Record<string, unknown> = {},
) {
  return function evaluate() {
    const contextDef = Object.keys(context)
      .map((key) => `${key} = this.${key}`)
      .join(',');
    const def = contextDef ? `let ${contextDef};` : '';

    return eval(`${def}${code}`);
  }.call(context);
}
