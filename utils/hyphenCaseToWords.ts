export default function hyphenCaseToWords(hyphenCase: string) {
  return hyphenCase
    .split('-')
    .map((word, index) =>
      index === 0 ? word[0].toUpperCase() + word.substring(1) : word,
    )
    .join(' ');
}
