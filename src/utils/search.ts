import { Fzf, byLengthAsc } from 'fzf';

export type SearchResult = {
  type: 'WEB' | 'SCRAPBOX_PAGE' | 'SCRAPBOX_HELP';
  content: string;
  description: string;
};
export type SearchResults = SearchResult[];

const segmenter = new Intl.Segmenter(['ja-JP', `en-US`], {
  granularity: 'word',
});

const segmentText = (text: string) =>
  [...segmenter.segment(text)]
    .filter((segment) => segment.isWordLike)
    .map((x) => x.segment)
    .join(' ');

const splitAlphaNum = (str: string) => {
  const parts = str.match(/\D+|\d+/g);
  return parts ? parts.join(' ') : '';
};

export const search = (data: SearchResults, text: string): SearchResults => {
  const segmented = data.map((x) => ({
    ...x,
    segmented: splitAlphaNum(segmentText(x.description)).toLowerCase(),
  }));
  const fzf = new Fzf(segmented, {
    selector: (x) => x.segmented,
    tiebreakers: [byLengthAsc],
  });
  const searchText = splitAlphaNum(segmentText(text)).toLowerCase();
  const result = fzf.find(searchText);
  return result.map((x) => x.item);
};
