import { storage } from '#imports';

export type ScrapboxPage = {
  project: string;
  title: string;
  url: string;
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
  if (pages.some((x) => x.url === page.url)) return;
  pages.push(page);
  const newPageStorage = data.filter((x) => x.project !== project);
  await pageStorage.setValue([...newPageStorage, { project: project, pages }]);
};

export const putPages = async (project: string, pages: ScrapboxPage[]) => {
  const data = (await getAllScrapboxPages()) || [];
  const filtered = data.filter((x) => x.project !== project);
  await pageStorage.setValue([...filtered, { project, pages }]);
};
