export default function hyphenCaseToCamelCase(hyphenCase: string) {
  return hyphenCase
    .split('-')
    .map((word, index) =>
      index === 0 ? word : word[0].toUpperCase() + word.substring(1),
    )
    .join('');
}
