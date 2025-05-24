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
import {
  addHelpForPage,
  editHelp,
  getAllHelp,
  HelpStorage,
  watchHelpStorage,
} from '@/utils/help/storage';
import {
  openUrlInCurrentTab,
  openUrlInNewBackgroundTab,
  openUrlInNewTab,
  openUrlInNewWindow,
} from '@/utils/open';
import { getAllScrapboxPages, ScrapboxPageStorage } from '@/utils/page/storage';
import { expand } from '@/utils/parser/helpfeel';
import { matchScrapboxUrl } from '@/utils/scrapbox';
import { search, SearchResult } from '@/utils/search';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  ChevronLeft,
  ChevronRight,
  CornerDownLeft,
  ExternalLink,
  FilePlus,
  Globe,
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
const scrapboxPageStorageAtom = atom<ScrapboxPageStorage>([]);
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
const isEditHelpPage = atom((get) => {
  const page = get(pageAtom);
  if (!page) return false;
  return page === 'edit-help';
});
const editingCommandAtom = atom('');
const isTopPage = atom((get) => {
  const page = get(pageAtom);
  if (!page) return true;
  return false;
});
const helpfeelExpandedAtom = atom((get) => {
  if (!(get(isAddHelpPage) || get(isEditHelpPage))) return [];
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
  const scrapboxPageStorage = get(scrapboxPageStorageAtom);
  const suggests = helpStorage
    .flatMap((item) =>
      item.help.flatMap((help) =>
        expand(help.command).map((e) => ({
          content: help.open,
          description: e,
        }))
      )
    )
    .concat(
      scrapboxPageStorage.flatMap((item) => ({
        content: item.url,
        description: item.title,
      }))
    );
  const result = search(suggests, searchText);
  return result
    .reduce((acc, item) => {
      const isDuplicate = acc.some((i) => i.content === item.content);
      if (!isDuplicate) acc.push(item);
      return acc;
    }, [] as SearchResult[])
    .slice(0, 8);
});
const activeTabHelpAtom = atom(async (get) => {
  const activeUrl = get(activeUrlAtom);
  if (!activeUrl) return [];
  const helpStorage = get(helpStorageAtom);
  const pageHelp = helpStorage
    .filter((item) => item.page === activeUrl)
    .flatMap((item) => item.help);
  return pageHelp;
});

function App() {
  const setHelpStorage = useSetAtom(helpStorageAtom);
  const setScrapboxPageStorage = useSetAtom(scrapboxPageStorageAtom);
  const [searchText, setSearchText] = useAtom(searchTextAtom);
  const searchResults = useAtomValue(searchResultsAtom);
  const helpfeelExpanded = useAtomValue(helpfeelExpandedAtom);
  const nowAddHelpPage = useAtomValue(isAddHelpPage);
  const nowTopPage = useAtomValue(isTopPage);
  const nowEditPage = useAtomValue(isEditHelpPage);
  const [pages, setPages] = useAtom(pagesAtom);
  const setActiveTabId = useSetAtom(activeTabIdAtom);
  const [activeUrl, setActiveUrl] = useAtom(activeUrlAtom);
  const activeTabHelp = useAtomValue(activeTabHelpAtom);
  const [editingCommand, setEditingCommand] = useAtom(editingCommandAtom);

  useEffect(() => {
    getAllHelp().then((helpStorage) => {
      setHelpStorage(helpStorage);
    });
    getAllScrapboxPages().then((scrapboxPageStorage) => {
      setScrapboxPageStorage(scrapboxPageStorage);
    });
    const unwatchHelpStorage = watchHelpStorage((n) => {
      setHelpStorage(n);
    });
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      setActiveTabId(tabs[0].id);
      setActiveUrl(tabs[0].url);
    });

    return () => {
      unwatchHelpStorage();
    };
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
          (e.key === 'Escape' && !nowTopPage) ||
          (e.key === 'Escape' && searchText.length > 0) ||
          (e.key === 'Backspace' && searchText.length === 0)
        ) {
          setSearchText('');
          e.preventDefault();
          backPage();
        }
      }}
    >
      <CommandInput
        value={searchText}
        onValueChange={setSearchText}
        placeholder={nowAddHelpPage ? 'Helpfeel記法' : 'ページを検索する'}
        autoFocus
        icon={
          !nowTopPage ? (
            <>
              <ChevronLeft className="size-4 shrink-0 opacity-50" />
              <MessageCircleQuestion className="size-4 shrink-0 opacity-50" />
            </>
          ) : undefined
        }
      />
      <CommandList className="max-h-[389px]">
        {nowTopPage && searchResults.length > 0 && (
          <>
            <CommandGroup heading="ページを開く">
              {searchResults.map((item) => (
                <CommandItem
                  key={`${item.content}-${item.description}`}
                  value={`${item.content}-${item.description}`}
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
        {nowTopPage && (
          <CommandGroup heading="コマンド">
            {searchText.length > 0 && (
              <>
                <CommandItem
                  className="text-xs"
                  onSelect={async () => {
                    let disposition: 'CURRENT_TAB' | 'NEW_TAB' | 'NEW_WINDOW' =
                      'CURRENT_TAB';
                    if (isHotkeyPressed(['ctrl', 'shift']))
                      disposition = 'NEW_WINDOW';
                    else if (
                      isHotkeyPressed('ctrl') ||
                      isHotkeyPressed('shift')
                    )
                      disposition = 'NEW_TAB';
                    await browser.runtime.sendMessage({
                      type: 'scrapbox-help-extension:popup:search',
                      query: searchText,
                      disposition: disposition,
                    });
                    window.close();
                  }}
                >
                  <Globe />
                  <span>検索エンジンで検索する</span>
                  <CommandShortcut>
                    <ExternalLink />
                  </CommandShortcut>
                </CommandItem>
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
              </>
            )}
            <CommandItem
              className="text-xs"
              onSelect={() => setPages([...pages, 'add-help'])}
            >
              <MessageCircleQuestion />
              <span>このページのヘルプを追加する</span>
              <CommandShortcut>
                <ChevronRight />
              </CommandShortcut>
            </CommandItem>
          </CommandGroup>
        )}
        {nowAddHelpPage && (
          <CommandGroup heading="コマンド">
            <CommandItem
              className="text-xs"
              onSelect={() => {
                if (!activeUrl) return;
                addHelpForPage(activeUrl, {
                  command: searchText,
                  open: activeUrl,
                }).then(() => {
                  setSearchText('');
                  backPage();
                });
              }}
              disabled={helpfeelExpanded.length === 0}
            >
              <span>ヘルプを追加する</span>
              <CommandShortcut>
                <CornerDownLeft />
              </CommandShortcut>
            </CommandItem>
          </CommandGroup>
        )}
        {nowEditPage && (
          <CommandGroup heading="コマンド">
            <CommandItem
              className="text-xs"
              onSelect={() => {
                if (!activeUrl) return;
                editHelp(activeUrl, editingCommand, searchText).then(() => {
                  setSearchText('');
                  backPage();
                });
              }}
              disabled={helpfeelExpanded.length === 0}
            >
              <span>ヘルプを更新する</span>
              <CommandShortcut>
                <CornerDownLeft />
              </CommandShortcut>
            </CommandItem>
          </CommandGroup>
        )}
        {helpfeelExpanded.length > 0 && (
          <>
            <CommandSeparator alwaysRender />
            <CommandGroup
              heading={<span className="flex">Helpfeel記法を展開後▼</span>}
            >
              {helpfeelExpanded.map((item) => (
                <CommandItem disabled key={item} className="text-xs">
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {nowTopPage && activeTabHelp.length > 0 && searchText.length === 0 && (
          <>
            <CommandSeparator alwaysRender />
            <CommandGroup heading="このページのヘルプ">
              {activeTabHelp.map((item) => (
                <CommandItem
                  key={item.command}
                  className="text-xs"
                  onSelect={() => {
                    setPages([...pages, 'edit-help']);
                    setEditingCommand(item.command);
                    setSearchText(item.command);
                  }}
                  onHighlight={() => {
                    setEditingCommand(item.command);
                  }}
                >
                  <span>{item.command}</span>
                  <CommandShortcut>
                    <ChevronRight />
                  </CommandShortcut>
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
