import { Fzf } from 'fzf';

export type SearchResult = {
  content: string;
  description: string;
};
export type SearchResults = SearchResult[];

// const segmenter = new Intl.Segmenter(['ja-JP', `en-US`], {
//   granularity: 'word',
// });

// const segmentText = (text: string) =>
//   [...segmenter.segment(text)]
//     .filter((segment) => segment.isWordLike)
//     .map((x) => x.segment)
//     .join(' ');

// const splitAlphaNum = (str: string) => {
//   const parts = str.match(/\D+|\d+/g);
//   return parts ? parts.join(' ') : '';
// };

export const search = (data: SearchResults, text: string): SearchResults => {
  const segmented = data.map((x) => ({
    ...x,
    segmented: x.description,
  }));
  const fzf = new Fzf(segmented, {
    selector: (x) => x.segmented,
  });
  const searchText = text;
  const result = fzf.find(searchText);
  return result.map((x) => x.item);
};
