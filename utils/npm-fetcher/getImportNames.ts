import { parse } from 'es-module-lexer';

export default function getImportNames(code: string): Array<string> {
  const [imports] = parse(code);
  return imports.map(({ n }) => n).filter(Boolean) as Array<string>;
}
