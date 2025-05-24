import { storage } from '#imports';

export type ScrapboxPage = {
  project: string;
  title: string;
  url: string;
};
export type ScrapboxPageStorage = ScrapboxPage[];

const pageStorage = storage.defineItem<ScrapboxPageStorage>('local:pages', {
  fallback: [],
});

export const getAllScrapboxPages = async () => {
  return await pageStorage.getValue();
};
export const watchPageStorage = pageStorage.watch;

export const putPage = async (page: ScrapboxPage) => {
  const currentPages = (await getAllScrapboxPages()) || [];
  if (currentPages.some((x) => x.url === page.url)) return;
  currentPages.push(page);
  await pageStorage.setValue(currentPages);
};

export const putPages = async (pages: ScrapboxPageStorage) => {
  const currentPages = (await getAllScrapboxPages()) || [];
  const filtered = currentPages.filter(
    (x) => !pages.some((p) => p.url === x.url)
  );
  await pageStorage.setValue([...filtered, ...pages]);
};
