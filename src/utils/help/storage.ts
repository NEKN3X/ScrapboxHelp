import { storage } from '#imports';

export type Help = {
  command: string;
  open: string;
};
export type HelpStorageItem = {
  page: string;
  help: Help[];
};
export type HelpStorage = HelpStorageItem[];

const helpStorage = storage.defineItem<HelpStorage>('local:help-scrapbox', {
  fallback: [],
});

export const getAllHelp = async () => {
  const storageData = await helpStorage.getValue();
  return storageData;
};

const getHelpByPage = async (page: string) => {
  const storageData = await helpStorage.getValue();
  return storageData.filter((item) => item.page === page);
};

export const addHelpForPage = async (page: string, help: Help) => {
  const pageHelpItems = await getHelpByPage(page);
  const pageHelp = pageHelpItems.flatMap((item) => item.help);
  if (pageHelp.some((item) => item.command === help.command)) return;
  pageHelp.push(help);
  const newHelpStorageItem: HelpStorageItem = {
    page,
    help: Array.from(pageHelp),
  };
  await updateHelp(newHelpStorageItem);
};

export const updateHelp = async (input: HelpStorageItem) => {
  const storageData = await helpStorage.getValue();
  const filtered = storageData.filter((item) => item.page !== input.page);
  await helpStorage.setValue([...filtered, input]);
};

export const updateManyHelp = async (input: HelpStorageItem[]) => {
  const storageData = await helpStorage.getValue();
  const filtered = storageData.filter(
    (item) => !input.some((i) => i.page === item.page)
  );
  await helpStorage.setValue([...filtered, ...input]);
};
