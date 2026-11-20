// Minimal typings for the few Node APIs the liturgy asset tests use (the project has no
// @types/node).
declare const __dirname: string;

declare module 'node:fs' {
  const fs: {
    readFileSync(path: string, encoding: 'utf8'): string;
    readdirSync(path: string): string[];
    existsSync(path: string): boolean;
  };
  export default fs;
}

declare module 'node:path' {
  const path: {
    join(...parts: string[]): string;
    resolve(...parts: string[]): string;
  };
  export default path;
}
