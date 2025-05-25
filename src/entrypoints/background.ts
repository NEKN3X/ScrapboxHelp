import { browser, defineBackground } from '#imports';
import { extractHelp, updateScrapboxPageHelp } from '@/utils/help/scrapbox';
import { putPages, ScrapboxPage } from '@/utils/page/storage';
import { matchScrapboxUrl } from '@/utils/scrapbox';

export default defineBackground(async () => {
  let debounceTimer: NodeJS.Timeout | null = null;
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
            help: [],
          },
        ];
      });
      await putPages(message.project, data);
    }
    if (message.type === 'scrapbox-help-extension:popup:search') {
      console.log('Search query received:', message.query);

      await browser.search.query({
        text: message.query,
        disposition: message.disposition,
      });
    }
    if (message.type === 'scrapbox-help-extension:content-script:lines') {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const help = extractHelp(message.url, message.lines);
        console.log('help', help);
        await updateScrapboxPageHelp(message.project, message.url, help);
      }, 1000);
    }
  });
});
