import { HelpStorageItem, updateManyHelp } from './help/storage';

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
      page: `https://scrapbox.io/example-project2/example`,
      help: [
        {
          command: 'xyzに関する(説明|情報)',
          open: 'https://scrapbox.io/example-project2/xyz',
        },
        {
          command: 'abcに関する(説明|情報)',
          open: 'https://scrapbox.io/example-project2/abc',
        },
      ],
    },
  ];
  await updateManyHelp(example);
};
