import { HelpStorageItem, updateManyHelp } from './help/web';

export const storeExampleScrapboxHelp = async () => {
  const example: HelpStorageItem[] = [
    {
      page: `https://scrapbox.io/example-project/example`,
      help: [
        {
          command: '(例|example)',
          open: 'https://scrapbox.io/example-project/example',
        },
        {
          command: '(例2|example2)',
          open: 'https://scrapbox.io/example-project/example2',
        },
      ],
    },
    {
      page: 'https://wxt.dev',
      help: [
        {
          command: 'wxtに関する(説明|情報)',
          open: 'https://wxt.dev',
        },
        {
          command: 'wxtのドキュメント',
          open: 'https://wxt.dev',
        },
      ],
    },
  ];
  await updateManyHelp(example);
};
