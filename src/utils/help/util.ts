import { WxtStorageItem } from '#imports';

export type Help = {
  command: string;
  open: string;
};
export type HelpStorageItem = {
  page: string;
  help: Help[];
};
export type HelpStorage = HelpStorageItem[];
type WxtHelpStorageItem = WxtStorageItem<HelpStorage, {}>;

export const getAllHelp = async (storage: WxtHelpStorageItem) =>
  await storage.getValue();
export const watchHelpStorage = (storage: WxtHelpStorageItem) => storage.watch;

export const getHelpByPage =
  (storage: WxtHelpStorageItem) => async (page: string) =>
    (await storage.getValue())
      .filter((item) => item.page === page)
      .flatMap((item) => item.help);

export const addHelpForPage =
  (storage: WxtHelpStorageItem) => async (page: string, help: Help) => {
    const pageHelp = await getHelpByPage(storage)(page);
    if (pageHelp.some((item) => item.command === help.command)) return;
    pageHelp.push(help);
    const newHelpStorageItem: HelpStorageItem = {
      page,
      help: Array.from(pageHelp),
    };
    await updateHelp(storage)(newHelpStorageItem);
  };

export const editHelp =
  (storage: WxtHelpStorageItem) =>
  async (page: string, command: string, newCommand: string) => {
    if (command === newCommand) return;
    const help = await getHelpByPage(storage)(page);
    const target = help.find((item) => item.command === command);
    if (!target) return;
    const newHelpStorageItem: HelpStorageItem = {
      page,
      help: help
        .map((item) =>
          item.command === command ? { ...item, command: newCommand } : item
        )
        .filter((item) => item.command !== ''),
    };
    await updateHelp(storage)(newHelpStorageItem);
  };

const removeDuplicateHelp = (help: Help[]) => {
  return help.reduce((acc, item) => {
    const isDuplicate = acc.some((i) => i.command === item.command);
    if (!isDuplicate) acc.push(item);
    return acc;
  }, [] as Help[]);
};

export const updateHelp =
  (storage: WxtHelpStorageItem) => async (input: HelpStorageItem) => {
    const storageData = await storage.getValue();
    const filtered = storageData.filter((item) => item.page !== input.page);
    const newData = [
      ...filtered,
      { ...input, help: removeDuplicateHelp(input.help) },
    ].filter((item) => item.help.length > 0);
    console.log('Updating help storage:', newData);
    await storage.setValue(newData);
  };

export const updateManyHelp =
  (storage: WxtHelpStorageItem) => async (input: HelpStorageItem[]) => {
    const storageData = await storage.getValue();
    const filtered = storageData.filter(
      (item) => !input.some((i) => i.page === item.page)
    );
    const newData = [
      ...filtered,
      ...input.map((item) => ({
        ...item,
        help: removeDuplicateHelp(item.help),
      })),
    ];
    console.log('Updating many help storage:', newData);
    await storage.setValue(newData);
  };
