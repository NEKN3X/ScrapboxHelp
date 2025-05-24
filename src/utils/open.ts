import { browser } from '#imports';

export const openUrlInCurrentTab = (url: string) =>
  browser.tabs.update({ url });
export const openUrlInNewBackgroundTab = (url: string) =>
  browser.tabs.create({ url, active: false });
export const openUrlInNewTab = (url: string) =>
  browser.tabs.create({ url, active: true });
export const openUrlInNewWindow = (url: string) =>
  browser.windows.create({ url });
