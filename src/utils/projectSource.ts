const rawFiles = import.meta.glob<string>(
  [
    '../*.{ts,tsx,html,css,json}',
    '../components/**/*.{ts,tsx}',
    '../services/**/*.ts',
    '../utils/**/*.ts',
  ],
  { eager: true, import: 'default', query: '?raw' }
);

type ProjectFile = {
  path: string;
  content: string;
};

const normalizePath = (path: string) => path.replace(/^\.\.\//, '');

const entries: ProjectFile[] = Object.entries(rawFiles)
  .filter(([path]) => !path.endsWith('utils/projectSource.ts'))
  .map(([path, content]) => ({
    path: normalizePath(path),
    content: (content ?? '').trimEnd(),
  }))
  .sort((a, b) => a.path.localeCompare(b.path));

const sectionBreak = '\n\n/* --------------------------------------------- */\n\n';

export const PROJECT_FILES = entries;

export const SOURCE_CODE = entries
  .map(({ path, content }) => `// File: ${path}\n${content}`)
  .join(sectionBreak);
