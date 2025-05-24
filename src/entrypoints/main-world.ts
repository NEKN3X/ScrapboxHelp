import { defineUnlistedScript } from '#imports';

declare global {
  interface Window {
    scrapbox: any;
  }
}

export default defineUnlistedScript(() => {
  window.addEventListener('load', () => {
    const pages = window.scrapbox.Project.pages;
    if (!pages || pages.length === 0) return;
    const el = document.createElement('div');
    el.id = 'scrapbox-help-extension';
    el.setAttribute('data-pages', JSON.stringify(pages));
    window.document.body.append(el);
  });
});
