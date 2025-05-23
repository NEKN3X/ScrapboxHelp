import { defineBackground } from '#imports';
import { storeExampleScrapboxHelp } from '@/utils/example';

export default defineBackground(async () => {
  if (import.meta.env.MODE === 'development') {
    await storeExampleScrapboxHelp();
    console.log('Example scrapbox help stored');
  }
});
