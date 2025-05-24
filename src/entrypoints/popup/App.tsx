import { browser } from '#imports';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { addHelpForPage, getAllHelp, HelpStorage } from '@/utils/help/storage';
import {
  openUrlInCurrentTab,
  openUrlInNewBackgroundTab,
  openUrlInNewTab,
  openUrlInNewWindow,
} from '@/utils/open';
import { expand } from '@/utils/parser/helpfeel';
import { matchScrapboxUrl } from '@/utils/scrapbox';
import { search, SearchResult } from '@/utils/search';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  ChevronLeft,
  ChevronRight,
  CornerDownLeft,
  Delete,
  ExternalLink,
  FilePlus,
  Link2,
  MessageCircleQuestion,
  StickyNote,
} from 'lucide-react';
import { useEffect } from 'react';
import { isHotkeyPressed } from 'react-hotkeys-hook';

const activeTabIdAtom = atom<number>();
const activeUrlAtom = atom<string>();
const searchTextAtom = atom<string>('');
const helpStorageAtom = atom<HelpStorage>([]);
const pagesAtom = atom<string[]>([]);
const pageAtom = atom((get) => {
  const pages = get(pagesAtom);
  if (pages.length === 0) return undefined;
  return pages[pages.length - 1];
});
const isAddHelpPage = atom((get) => {
  const page = get(pageAtom);
  if (!page) return false;
  return page === 'add-help';
});
const isTopPage = atom((get) => {
  const page = get(pageAtom);
  if (!page) return true;
  return false;
});
const helpfeelExpandedAtom = atom((get) => {
  if (!get(isAddHelpPage)) return [];
  const command = get(searchTextAtom);
  try {
    return expand(command);
  } catch (e) {
    return [];
  }
});
const searchResultsAtom = atom((get) => {
  if (get(isAddHelpPage)) return [];
  const searchText = get(searchTextAtom);
  if (!searchText) return [];
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
  const nowAddHelpPage = useAtomValue(isAddHelpPage);
  const nowTopPage = useAtomValue(isTopPage);
  const [pages, setPages] = useAtom(pagesAtom);
  const setActiveTabId = useSetAtom(activeTabIdAtom);
  const [activeUrl, setActiveUrl] = useAtom(activeUrlAtom);

  useEffect(() => {
    getAllHelp().then((helpStorage) => {
      setHelpStorage(helpStorage);
    });
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      setActiveTabId(tabs[0].id);
      setActiveUrl(tabs[0].url);
    });
  }, []);

  const openUrlWithModifier = (url: string) => {
    if (isHotkeyPressed(['ctrl', 'shift'])) openUrlInNewWindow(url);
    else if (isHotkeyPressed('ctrl')) openUrlInNewTab(url);
    else if (isHotkeyPressed('shift')) openUrlInNewBackgroundTab(url);
    else openUrlInCurrentTab(url);
    window.close();
  };
  const backPage = () => setPages((pages) => pages.slice(0, -1));

  return (
    <Command
      shouldFilter={false}
      onKeyDown={(e) => {
        if (
          !nowTopPage &&
          (e.key === 'Escape' ||
            (e.key === 'Backspace' && searchText.length === 0))
        ) {
          e.preventDefault();
          backPage();
        }
      }}
    >
      <CommandInput
        value={searchText}
        onValueChange={setSearchText}
        placeholder={nowAddHelpPage ? 'Helpfeel記法' : 'コマンドを検索する'}
        autoFocus
        icon={
          nowAddHelpPage ? (
            <>
              <ChevronLeft className="size-4 shrink-0 opacity-50" />
              <MessageCircleQuestion className="size-4 shrink-0 opacity-50" />
            </>
          ) : undefined
        }
      />
      <CommandList>
        {nowTopPage && searchResults.length > 0 && (
          <>
            <CommandGroup heading="ページを開く">
              {searchResults.map((item) => (
                <CommandItem
                  key={`${item.content}-${item.description}`}
                  value={item.description}
                  className="text-xs"
                  onSelect={() => openUrlWithModifier(item.content)}
                >
                  {matchScrapboxUrl(item.content) ? <StickyNote /> : <Link2 />}
                  <span>{item.description}</span>
                  <CommandShortcut>
                    <ExternalLink />
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator alwaysRender />
          </>
        )}
        <CommandGroup heading="コマンド">
          {!nowAddHelpPage && searchText.length > 0 && (
            <CommandItem
              className="text-xs"
              onSelect={() =>
                openUrlWithModifier(
                  `https://scrapbox.io/${import.meta.env.VITE_NEW_PAGE_PROJECT}/${searchText}`
                )
              }
            >
              <FilePlus />
              <span>新しいページを作成する</span>
              <CommandShortcut>
                <ExternalLink />
              </CommandShortcut>
            </CommandItem>
          )}
          {nowTopPage && (
            <CommandItem
              className="text-xs"
              onSelect={() => setPages([...pages, 'add-help'])}
            >
              <MessageCircleQuestion />
              <span>ヘルプを追加する</span>
              <CommandShortcut>
                <ChevronRight />
              </CommandShortcut>
            </CommandItem>
          )}
          {nowAddHelpPage && (
            <>
              <CommandItem
                className="text-xs"
                onSelect={() => {
                  if (!activeUrl) return;
                  addHelpForPage(activeUrl, {
                    command: searchText,
                    open: activeUrl,
                  })
                    .then
                    // () => window.close()
                    ();
                }}
                disabled={helpfeelExpanded.length === 0}
              >
                <span>ヘルプを追加する</span>
                <CommandShortcut>
                  <CornerDownLeft />
                </CommandShortcut>
              </CommandItem>
              <CommandItem className="text-xs" onSelect={backPage}>
                <span>戻る</span>
                <CommandShortcut>
                  <Delete />
                </CommandShortcut>
              </CommandItem>
            </>
          )}
        </CommandGroup>
        {nowAddHelpPage && helpfeelExpanded.length > 0 && (
          <>
            <CommandSeparator alwaysRender />
            <CommandGroup
              heading={<span className="flex">Helpfeel記法を展開後▼</span>}
            >
              {nowAddHelpPage &&
                helpfeelExpanded.map((item) => (
                  <CommandItem disabled key={item} className="text-xs">
                    {item}
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
}

export default App;
