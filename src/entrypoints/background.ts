import { browser, defineBackground } from '#imports';
import { putPages, ScrapboxPage } from '@/utils/page/storage';
import { matchScrapboxUrl } from '@/utils/scrapbox';

export default defineBackground(async () => {
  console.log('Background script initialized and database created.');
  browser.runtime.onMessage.addListener(
    async (message: { type: string; pages: string[] }) => {
      if (message.type === 'scrapbox-help-extension:content-script:pages') {
        const data: ScrapboxPage[] = message.pages.flatMap((url) => {
          const match = matchScrapboxUrl(url);
          if (!match) return [];
          return [
            {
              ...match,
              url,
            },
          ];
        });
        await putPages(data);
      }
    }
  );
});
