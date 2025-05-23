export const matchScrapboxUrl = (url: string) => {
  const scrapboxUrlRegex = /https?:\/\/scrapbox\.io\/([^/]+)\/([^/]+)/;
  const match = url.match(scrapboxUrlRegex);
  if (match) {
    return {
      project: match[1],
      page: match[2],
    };
  }
  return null;
};
