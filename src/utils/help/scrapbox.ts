import { storage } from '#imports';
import { match, P } from 'ts-pattern';
import { Help, HelpStorage, HelpStorageItem } from './util';

export const scrapboxHelpStorage = storage.defineItem<HelpStorage>(
  'local:help-sb',
  {
    fallback: [],
  }
);

export const extractHelp = (page: string, lines: string[]): HelpStorageItem => {
  const help: Help[] = lines
    .map((x, i) => ({
      text: x,
      next: i + 1 < lines.length ? lines[i + 1] : undefined,
    }))
    .filter((x) => /^\?\s/.test(x.text))
    .map((x) => {
      const open = match(x.next)
        .with(P.string.regex(/^% (echo|open)\s+(.*)/), (v) =>
          v.replace(/^% (echo|open)\s+/, '')
        )
        .otherwise(() => page);

      return {
        command: x.text.replace(/^\?\s+/, ''),
        open,
      };
    });

  return {
    page,
    help,
  };
};
