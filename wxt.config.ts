import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: import.meta.env.APP_NAME,
    options_page: 'options.html',
    permissions: [
      'storage',
      'bookmarks',
      'tabs',
      'scripting',
      'activeTab',
      'background',
      'search',
    ],
    web_accessible_resources: [
      {
        resources: ['main-world.js'],
        matches: ['https://scrapbox.io/*'],
      },
    ],
  },
  imports: false,
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
