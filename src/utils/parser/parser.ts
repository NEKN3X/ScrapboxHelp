import { match, P } from 'ts-pattern';

export type Parser<T> = (input: string) => [T, string][];

export const parse = <T>(parser: Parser<T>) => {
  return (input: string) => parser(input);
};

export const item: Parser<string> = (input) =>
  match(input)
    .with('', (_) => [])
    .otherwise(() => [[input[0], input.slice(1)]]);

export const fmap = <A, B>(f: (x: A) => B, parser: Parser<A>): Parser<B> => {
  return (input) => parser(input).map(([x, rest]) => [f(x), rest]);
};

export const pure = <T>(x: T): Parser<T> => {
  return (input) => [[x, input]];
};

export const ap = <A, B>(pg: Parser<(x: A) => B>, px: Parser<A>): Parser<B> => {
  return (input) =>
    match(parse(pg)(input))
      .with([], () => [])
      .otherwise(([[g, out]]) => parse(fmap(g, px))(out));
};

export const bind = <A, B>(p: Parser<A>, f: (x: A) => Parser<B>): Parser<B> => {
  return (input) =>
    match(parse(p)(input))
      .with([], () => [])
      .otherwise(([[v, out]]) => parse(f(v))(out));
};

export const empty: Parser<never> = (_) => [];
export const orElse = <A>(a: Parser<A>, b: Parser<A>): Parser<A> => {
  return (input) =>
    match(a(input))
      .with([], (_) => b(input))
      .otherwise((v) => v);
};

// predicateを満たす1文字用のパーサー
export const sat = (predicate: (x: string) => boolean): Parser<string> => {
  return bind(item, (x) => (predicate(x) ? pure(x) : empty));
};

export const digit = sat((x) => /\d/.test(x));
export const lower = sat((x) => /[a-z]/.test(x));
export const upper = sat((x) => /[A-Z]/.test(x));
export const letter = sat((x) => /[a-zA-Z]/.test(x));
export const alphanum = sat((x) => /[a-zA-Z0-9]/.test(x));
export const char = (x: string) => sat((y) => x === y);

export const str = (s: string): Parser<string> => {
  return match(s)
    .with('', () => pure(s))
    .otherwise(() =>
      bind(char(s[0]), () => bind(str(s.slice(1)), () => pure(s)))
    );
};

export const many = <T>(parser: Parser<T>): Parser<T[]> => {
  return orElse(some(parser), pure([]));
};

export const defer = <T>(factory: () => Parser<T>): Parser<T> => {
  return (input) => factory()(input);
};
export const some = <T>(parser: Parser<T>): Parser<T[]> => {
  return ap(
    ap(
      pure((x: T) => (xs: T[]) => [x, ...xs]),
      parser
    ),
    defer(() => many(parser))
  );
};

export const ident = bind(lower, (x) =>
  bind(many(alphanum), (xs) => pure(x + xs.join('')))
);
export const nat = bind(some(digit), (xs) => pure(parseInt(xs.join(''), 10)));
const isSpace = (x: string) => /\s/.test(x);
export const space = bind(many(sat(isSpace)), () => pure(null));

export const int = orElse(
  bind(char('-'), () => bind(nat, (n: number) => pure(-n))),
  nat
);

export const token = <T>(parser: Parser<T>): Parser<T> => {
  return bind(space, () => bind(parser, (v) => pure(v)));
};

export const identifier = token(ident);
export const natural = token(nat);
export const integer = token(int);
export const symbol = (s: string) => token(str(s));

export const nats = bind(symbol(`[`), () =>
  bind(natural, (n) =>
    bind(many(bind(symbol(','), () => natural)), (ns) =>
      bind(symbol(`]`), () => pure([n, ...ns]))
    )
  )
);

export const factor: Parser<number> = orElse(
  bind(symbol('('), () => bind(expr, (e) => bind(symbol(')'), () => pure(e)))),
  natural
);
export const term: Parser<number> = bind(factor, (f) =>
  orElse(
    bind(symbol('*'), () => bind(term, (t) => pure(f * t))),
    pure(f)
  )
);
export const expr: Parser<number> = bind(term, (t) =>
  orElse(
    bind(symbol('+'), () => bind(expr, (e) => pure(t + e))),
    orElse(
      bind(symbol('-'), () => bind(expr, (e) => pure(t - e))),
      pure(t)
    )
  )
);
export const evaluate = (xs: string) => {
  return match(parse(expr)(xs))
    .with([], () => {
      throw new Error('Invalid input');
    })
    .with(P.array([P._, '']), ([[n, _]]) => n)
    .with(P.array([P._, P.string]), ([[_, out]]) => {
      throw new Error(`Unused input: ${out}`);
    })
    .exhaustive();
};
