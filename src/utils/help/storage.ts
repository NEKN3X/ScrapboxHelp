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
export const watchHelpStorage = helpStorage.watch;

export const getHelpByPage = async (page: string) => {
  const storageData = await helpStorage.getValue();
  return storageData
    .filter((item) => item.page === page)
    .flatMap((item) => item.help);
};

export const addHelpForPage = async (page: string, help: Help) => {
  const pageHelp = await getHelpByPage(page);
  if (pageHelp.some((item) => item.command === help.command)) return;
  pageHelp.push(help);
  const newHelpStorageItem: HelpStorageItem = {
    page,
    help: Array.from(pageHelp),
  };
  await updateHelp(newHelpStorageItem);
};

export const editHelp = async (
  page: string,
  command: string,
  newCommand: string
) => {
  if (command === newCommand) return;
  const help = await getHelpByPage(page);
  const target = help.find((item) => item.command === command);
  if (!target) return;
  const newHelpStorageItem: HelpStorageItem = {
    page,
    help: help.map((item) =>
      item.command === command ? { ...item, command: newCommand } : item
    ),
  };
  await updateHelp(newHelpStorageItem);
};

const removeDuplicateHelp = (help: Help[]) => {
  return help.reduce((acc, item) => {
    const isDuplicate = acc.some((i) => i.command === item.command);
    if (!isDuplicate) acc.push(item);
    return acc;
  }, [] as Help[]);
};

export const updateHelp = async (input: HelpStorageItem) => {
  const storageData = await helpStorage.getValue();
  const filtered = storageData.filter((item) => item.page !== input.page);
  await helpStorage.setValue([
    ...filtered,
    { ...input, help: removeDuplicateHelp(input.help) },
  ]);
};

export const updateManyHelp = async (input: HelpStorageItem[]) => {
  const storageData = await helpStorage.getValue();
  const filtered = storageData.filter(
    (item) => !input.some((i) => i.page === item.page)
  );
  await helpStorage.setValue([
    ...filtered,
    ...input.map((item) => ({
      ...item,
      help: removeDuplicateHelp(item.help),
    })),
  ]);
};
