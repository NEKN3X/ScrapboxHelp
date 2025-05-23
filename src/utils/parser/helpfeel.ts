import { match, P } from 'ts-pattern';
import { bind, orElse, parse, Parser, pure, sat, some, symbol } from './parser';

// helpfeel記法を展開する
// "? ログイン方法がわからない"
// -> ["ログイン方法がわからない"]
// "? (ログイン|サインイン)方法がわからない"
// -> ["ログイン方法がわからない", "サインイン方法がわからない"]
// "? (ログイン|:サインイン)方法がわからない"
// -> ["ログイン方法がわからない", "サインイン方法がわからない"]
// "? [質問]と記載する"
// -> ["質問と記載する"]
// Glossary
// pc: ([パソコン]|[PC])
// destroy: ([廃棄]する|捨てる)
// "? {pc}を{destroy}にはどうすればいいですか？"
// -> [
// "パソコンを廃棄するにはどうすればいいですか？",
// "パソコンを捨てるにはどうすればいいですか？",
// "PCを廃棄するにはどうすればいいですか？",
// "PCを捨てるにはどうすればいいですか？",
// ]
// 記法
// "? ": 最初は"? "で始まる
// (word1|word2): 言い換え表現
// {word}: Glossary
// 無視する記法
// [word]: 検索の強化
// (word1|:word2): 劣後

// 1. [[], 'xyz(abc|123|あいう)']
// 2. [['xyzabc'], 'xyz(123|あいう)']
// 3. [['xyzabc', 'xyz123'], 'xyz(あいう)']
// 4. [['xyzabc', 'xyz123', 'xyzあいう'], '']

const letter = sat((x) => /[^()|]/.test(x));
const str: Parser<string[]> = bind(some(letter), (s) => pure([s.join('')]));

export const factor: Parser<string[]> = orElse(
  bind(symbol('('), () =>
    bind(synonym, (syn) => bind(symbol(')'), () => pure(syn)))
  ),
  str
);

export const synonym: Parser<string[]> = bind(
  orElse(
    factor,
    bind(symbol('|'), () => bind(synonym, (syn) => pure([''].concat(syn))))
  ),
  (f) => {
    return orElse(
      bind(symbol('|'), () => bind(synonym, (syn) => pure(f.concat(syn)))),
      pure(f)
    );
  }
);

export const literal: Parser<string[]> = bind(factor, (f) => {
  return orElse(
    bind(literal, (lit) => pure(f.flatMap((x) => lit.map((y) => x.concat(y))))),
    pure(f)
  );
});

export const expand = (input: string) => {
  return match(parse(literal)(input))
    .with([], () => {
      throw new Error('Invalid input');
    })
    .with(P.array([P._, '']), ([[n]]) => n)
    .with(P.array([P._, P.string]), ([[, out]]) => {
      throw new Error(`Unused input: ${out}`);
    })
    .exhaustive();
};
