export default function tryEvaluate<T>(
  fn: () => T,
  errorToString: (e: unknown) => string,
) {
  try {
    const data = fn();
    return { data, errorMessage: null };
  } catch (e) {
    console.error(e);
    const errorMessage = errorToString(e);
    return { data: null, errorMessage };
  }
}
