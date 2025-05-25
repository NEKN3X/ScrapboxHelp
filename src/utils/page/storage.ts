import { storage } from '#imports';
import { Help } from '../help/util';

export type ScrapboxPage = {
  project: string;
  title: string;
  url: string;
  help: Help[];
};
export type ScrapboxPageStorage = {
  project: string;
  pages: ScrapboxPage[];
}[];

const pageStorage = storage.defineItem<ScrapboxPageStorage>('local:pages', {
  fallback: [],
});

export const getAllScrapboxPages = async () => {
  return await pageStorage.getValue();
};
export const watchPageStorage = pageStorage.watch;

export const putPage = async (page: ScrapboxPage) => {
  const data = (await getAllScrapboxPages()) || [];
  const project = page.project;
  const pages = data.find((x) => x.project === project)?.pages || [];
  const filtered = pages.filter((x) => x.url !== page.url);
  filtered.push(page);
  const newPageStorage = data.filter((x) => x.project !== project);
  await pageStorage.setValue([
    ...newPageStorage,
    { project: project, pages: filtered },
  ]);
};

export const putPages = async (project: string, pages: ScrapboxPage[]) => {
  const data = (await getAllScrapboxPages()) || [];
  const filtered = data.filter((x) => x.project !== project);
  const old = data.find((x) => x.project === project);
  const existingPages =
    old?.pages.filter((x) => pages.some((p) => p.url === x.url)) || [];
  const newPages = pages.filter(
    (x) => !old?.pages.some((p) => p.url === x.url)
  );
  const newData = [
    ...filtered,
    { project, pages: [...existingPages, ...newPages] },
  ];
  await pageStorage.setValue(newData);
};
