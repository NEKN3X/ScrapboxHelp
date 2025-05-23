import { SearchResult } from '@/utils/search';

function SearchResultItem({
  item,
  onClick,
}: {
  item: SearchResult;
  onClick: () => void;
}) {
  return <div>{item.description}</div>;
}

export { SearchResultItem };
