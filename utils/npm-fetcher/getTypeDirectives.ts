export default function getTypeDirectives(code: string): string[] {
  const regex = /\/\/\/\s*<reference path="([^"]+).d.ts" \/>/g;
  const imports: string[] = [];

  for (const match of code.matchAll(regex)) {
    imports.push(match[1]);
  }

  return imports;
}
