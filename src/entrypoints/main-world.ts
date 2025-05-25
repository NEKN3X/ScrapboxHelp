import { defineUnlistedScript } from '#imports';

declare global {
  interface Window {
    scrapbox: any;
  }
}

export default defineUnlistedScript(() => {
  window.addEventListener('load', () => {
    const scrapbox = window.scrapbox;
    const pages = scrapbox.Project.pages;
    if (!pages || pages.length === 0) return;
    if (document.getElementById('scrapbox-help-extension-pages')) return;
    const pagesEl = document.createElement('div');
    pagesEl.id = 'scrapbox-help-extension-pages';
    const pageTitles = pages.map((page: any) => ({ title: page.title }));
    console.log('Scrapbox pages:', pages);
    pagesEl.setAttribute('data-pages', JSON.stringify(pageTitles));
    window.document.body.append(pagesEl);
  });
  window.addEventListener('load', () => {
    const scrapbox = window.scrapbox;
    const page = scrapbox.Page;
    if (!page) return;
    if (document.getElementById('scrapbox-help-extension-lines')) return;
    scrapbox.on('lines:changed', () => {
      const linesEl =
        document.getElementById('scrapbox-help-extension-lines') ||
        document.createElement('div');
      linesEl.id = 'scrapbox-help-extension-lines';
      linesEl.setAttribute(
        'data-lines',
        JSON.stringify(scrapbox.Page.lines.map((line: any) => line.text))
      );
      window.document.body.append(linesEl);
    });
  });
});
