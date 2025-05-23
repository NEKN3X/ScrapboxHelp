import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { getAllHelp, HelpStorage } from '@/utils/help/storage';
import { expand } from '@/utils/parser/helpfeel';
import { search, SearchResult } from '@/utils/search';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

const searchTextAtom = atom<string>('');
const helpStorageAtom = atom<HelpStorage>([]);
const isHelpfeelModeAtom = atom((get) => {
  const searchText = get(searchTextAtom);
  return /^\? /.test(searchText);
});
const helpfeelExpandedAtom = atom((get) => {
  if (!get(isHelpfeelModeAtom)) return [];
  const helpfeelCommand = get(searchTextAtom).replace(/^\? /, '');
  try {
    const expanded = expand(helpfeelCommand);
    return expanded;
  } catch (e) {
    return [];
  }
});
const searchResultsAtom = atom((get) => {
  if (get(isHelpfeelModeAtom)) return [];
  const searchText = get(searchTextAtom);
  const helpStorage = get(helpStorageAtom);
  const suggests = helpStorage.flatMap((item) =>
    item.help.flatMap((help) =>
      expand(help.command).map((e) => ({
        content: help.open,
        description: e,
      }))
    )
  );
  const result = search(suggests, searchText);
  return result.reduce((acc, item) => {
    const isDuplicate = acc.some((i) => i.content === item.content);
    if (!isDuplicate) acc.push(item);
    return acc;
  }, [] as SearchResult[]);
});

function App() {
  const setHelpStorage = useSetAtom(helpStorageAtom);
  const [searchText, setSearchText] = useAtom(searchTextAtom);
  const searchResults = useAtomValue(searchResultsAtom);
  const helpfeelExpanded = useAtomValue(helpfeelExpandedAtom);
  const isHelpfeelMode = useAtomValue(isHelpfeelModeAtom);

  useEffect(() => {
    getAllHelp().then((helpStorage) => {
      setHelpStorage(helpStorage);
    });
  }, []);

  return (
    <Command shouldFilter={false}>
      <CommandInput
        value={searchText}
        onValueChange={setSearchText}
        placeholder="φ(..)"
        autoFocus
      />
      <CommandList>
        <CommandGroup>
          {searchResults.map((item) => (
            <CommandItem
              key={`${item.content}-${item.description}`}
              value={item.description}
              className="text-xs"
            >
              {item.description}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup>
          {isHelpfeelMode && (
            <CommandItem
              disabled={helpfeelExpanded.length === 0}
              className="text-xs"
            >
              ヘルプを追加する<span className="opacity-45">展開後▼</span>
            </CommandItem>
          )}
          {helpfeelExpanded.map((item) => (
            <CommandItem disabled key={item} className="text-xs">
              {item}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export default App;
