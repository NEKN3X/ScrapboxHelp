import { storage } from '#imports';
import { HelpStorage } from './util';

export const webHelpStorage = storage.defineItem<HelpStorage>(
  'local:help-web',
  {
    fallback: [],
  }
);
