import { match, P } from 'ts-pattern';
import { getAllScrapboxPages, putPage } from '../page/storage';
import { Help } from './util';

export const extractHelp = (page: string, lines: string[]): Help[] => {
  return lines
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
};

export const updateScrapboxPageHelp = async (
  project: string,
  url: string,
  help: Help[]
) => {
  const pageStorage = await getAllScrapboxPages();
  const pages = pageStorage.find((x) => x.project === project);
  if (!pages) return;
  const page = pages.pages.find((x) => x.url === url);
  if (!page) return;
  await putPage({
    ...page,
    help,
  });
};
