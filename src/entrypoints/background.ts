import { browser, defineBackground } from '#imports';
import { putPages, ScrapboxPage } from '@/utils/page/storage';
import { matchScrapboxUrl } from '@/utils/scrapbox';

export default defineBackground(async () => {
  browser.runtime.onMessage.addListener(async (message) => {
    console.log('Background script received message:', message);
    if (message.type === 'scrapbox-help-extension:content-script:pages') {
      const data: ScrapboxPage[] = message.pages.flatMap((url: string) => {
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
    if (message.type === 'scrapbox-help-extension:popup:search') {
      console.log('Search query received:', message.query);

      await browser.search.query({
        text: message.query,
        disposition: message.disposition,
      });
    }
  });
});
