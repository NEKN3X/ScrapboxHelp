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

export const updateHelp = async (input: HelpStorageItem) => {
  const storageData = await helpStorage.getValue();
  [storageData.filter((item) => item.page !== input.page), input];
};

export const updateManyHelp = async (input: HelpStorageItem[]) => {
  const storageData = await helpStorage.getValue();
  const newStorageData = storageData.filter(
    (item) => !input.some((i) => i.page === item.page)
  );
  helpStorage.setValue([...newStorageData, ...input]);
};
