export default function getTypeDirectives(code: string) {
  const regex = /\/\/\/\s*<reference path="([^"]+).d.ts" \/>/g;
  const imports: Array<string> = [];
  const matches = code.matchAll(regex);
  while (true) {
    const match = matches.next();
    if (match.done) {
      break;
    }
    imports.push(match.value[1]);
  }

  return imports;
}
