import { HelpStorageItem, updateManyHelp } from './help/storage';

export const storeExampleScrapboxHelp = async () => {
  const example: HelpStorageItem[] = [
    {
      page: `https://scrapbox.io/example-project/example`,
      help: [
        {
          command: 'example',
          open: 'https://scrapbox.io/example-project/example',
        },
        {
          command: 'example2',
          open: 'https://scrapbox.io/example-project/example2',
        },
      ],
    },
    {
      page: `https://scrapbox.io/example-project2/example`,
      help: [
        {
          command: 'example3',
          open: 'https://scrapbox.io/example-project2/example3',
        },
        {
          command: 'example4',
          open: 'https://scrapbox.io/example-project2/example4',
        },
      ],
    },
  ];
  await updateManyHelp(example);
};
