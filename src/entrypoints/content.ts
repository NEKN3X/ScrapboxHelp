import { browser, defineContentScript, injectScript } from '#imports';
import { matchScrapboxUrl } from '@/utils/scrapbox';

export default defineContentScript({
  matches: ['https://scrapbox.io/*'],
  async main() {
    const match = matchScrapboxUrl(location.href);
    if (!match) return;
    if (match?.project !== import.meta.env.VITE_NEW_PAGE_PROJECT) return;
    await injectScript('/main-world.js', {
      keepInDom: true,
    });
    const pagesObserver = new MutationObserver(async (x) => {
      const el = document.getElementById('scrapbox-help-extension-pages');
      if (!el) return;
      const pages = JSON.parse(el.getAttribute('data-pages') || '[]');
      el.remove();
      browser.runtime.sendMessage({
        type: 'scrapbox-help-extension:content-script:pages',
        project: match.project,
        pages: pages.map(
          (x: any) => `https://scrapbox.io/${match.project}/${x.title}`
        ),
      });
    });
    pagesObserver.observe(document.body, {
      childList: true,
    });
    const linesObserver = new MutationObserver(async (x) => {
      const el = document.getElementById('scrapbox-help-extension-lines');
      if (!el) return;
      const lines = JSON.parse(el.getAttribute('data-lines') || '[]');
      el.remove();
      browser.runtime.sendMessage({
        type: 'scrapbox-help-extension:content-script:lines',
        project: match.project,
        page: match.title,
        url: location.href,
        lines,
      });
    });
    linesObserver.observe(document.body, {
      childList: true,
    });
  },
});
