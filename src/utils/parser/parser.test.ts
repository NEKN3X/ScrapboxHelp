import { expect, test } from 'vitest';
import {
  ap,
  bind,
  char,
  digit,
  empty,
  evaluate,
  expr,
  factor,
  fmap,
  int,
  item,
  many,
  nat,
  nats,
  orElse,
  parse,
  pure,
  some,
  space,
  str,
  term,
} from './parser';

test('item', () => {
  const result = parse(item);
  expect(result('')).toEqual([]);
  expect(result('a')).toEqual([['a', '']]);
  expect(result('abc')).toEqual([['a', 'bc']]);
});

const toUpper = (x: string) => x.toUpperCase();

test('fmap', () => {
  const result = parse(fmap(toUpper, item));
  expect(result('abc')).toEqual([['A', 'bc']]);
  expect(result('')).toEqual([]);
});

test('pure', () => {
  const result = parse(pure(1));
  expect(result('abc')).toEqual([[1, 'abc']]);
  expect(result('')).toEqual([[1, '']]);
});

const three = ap(
  ap(
    ap(
      pure((x: string) => (_: string) => (z: string) => [x, z]),
      item
    ),
    item
  ),
  item
);

const three2 = bind(item, (x: string) =>
  bind(item, (y: string) =>
    bind(item, (z: string) => {
      return pure([x, z]);
    })
  )
);

test('three', () => {
  const result = parse(three);
  expect(result('abcdef')).toEqual([[['a', 'c'], 'def']]);
  expect(result('ab')).toEqual([]);
  expect(result('')).toEqual([]);
});

test('three2', () => {
  const result = parse(three2);
  expect(result('abcdef')).toEqual([[['a', 'c'], 'def']]);
  expect(result('ab')).toEqual([]);
  expect(result('')).toEqual([]);
});

test('empty', () => {
  const result = parse(empty);
  expect(result('abc')).toEqual([]);
});

test('orElse', () => {
  const result = parse(orElse(item, pure('d')));
  expect(result('abc')).toEqual([['a', 'bc']]);
  expect(result('')).toEqual([['d', '']]);
  const result2 = parse(orElse(empty, pure('d')));
  expect(result2('abc')).toEqual([['d', 'abc']]);
  expect(result('')).toEqual([['d', '']]);
});

test('digit', () => {
  const result = parse(digit);
  expect(result('123abc')).toEqual([['1', '23abc']]);
  expect(result('')).toEqual([]);
});

test('char', () => {
  const result = parse(char('a'));
  expect(result('abc')).toEqual([['a', 'bc']]);
  expect(result('bcd')).toEqual([]);
  expect(result('')).toEqual([]);
});

test('str', () => {
  const result = parse(str('abc'));
  expect(result('abcdef')).toEqual([['abc', 'def']]);
  expect(result('ab1234')).toEqual([]);
  expect(result('')).toEqual([]);
});

test('many', () => {
  const result = parse(many(digit));
  expect(result('123abc')).toEqual([[['1', '2', '3'], 'abc']]);
  expect(result('abc')).toEqual([[[], 'abc']]);
  expect(result('')).toEqual([[[], '']]);
});

test('some', () => {
  const result = parse(some(digit));
  expect(result('123abc')).toEqual([[['1', '2', '3'], 'abc']]);
  expect(result('abc')).toEqual([]);
  expect(result('')).toEqual([]);
});

test('space', () => {
  const result = parse(space);
  expect(result('   abc')).toEqual([[null, 'abc']]);
  expect(result('abc')).toEqual([[null, 'abc']]);
  expect(result('')).toEqual([[null, '']]);
});

test('nat', () => {
  const result = parse(nat);
  expect(result('123abc')).toEqual([[123, 'abc']]);
  expect(result('123 abc')).toEqual([[123, ' abc']]);
  expect(result('abc')).toEqual([]);
  expect(result('')).toEqual([]);
});

test('int', () => {
  const result = parse(int);
  expect(result('123abc')).toEqual([[123, 'abc']]);
  expect(result('-123abc')).toEqual([[-123, 'abc']]);
  expect(result('abc')).toEqual([]);
  expect(result('')).toEqual([]);
});

test('nats', () => {
  const result = parse(nats);
  expect(result(' [1, 2, 3] ')).toEqual([[[1, 2, 3], ' ']]);
  expect(result(' [1, 2] abc')).toEqual([[[1, 2], ' abc']]);
  expect(result(' [1, 2,]')).toEqual([]);
});

test('expr', () => {
  expect(parse(expr)('2 * 3 + 4')).toEqual([[10, '']]);
  expect(parse(expr)('2 * (3 + 4)')).toEqual([[14, '']]);
  expect(parse(expr)('(2+(4+3)) * 4')).toEqual([[36, '']]);
});
test('term', () => {
  expect(parse(term)('2 + 3 + 4')).toEqual([[2, ' + 3 + 4']]);
  expect(parse(term)('2 + 3 * 4')).toEqual([[2, ' + 3 * 4']]);
  expect(parse(term)('2 * 3 + 4')).toEqual([[6, ' + 4']]);
  expect(parse(term)('(2 + 3) + 4')).toEqual([[5, ' + 4']]);
  expect(parse(term)('2 * (3 + 4)')).toEqual([[14, '']]);
  expect(parse(term)('(2+(4+3)) * 4')).toEqual([[36, '']]);
});
test('factor', () => {
  expect(parse(factor)('2 * 3 + 4')).toEqual([[2, ' * 3 + 4']]);
  expect(parse(factor)('2 * (3 + 4)')).toEqual([[2, ' * (3 + 4)']]);
  expect(parse(factor)('(2+(4+3)) * 4')).toEqual([[9, ' * 4']]);
});

test('evaluate', () => {
  expect(evaluate('2 * 3 + 4')).toEqual(10);
  expect(evaluate('2*3-10')).toEqual(-4);
  expect(evaluate('2*(3+4)')).toEqual(14);
  expect(() => evaluate('2*3^4')).toThrow('Unused input: ^4');
  expect(() => evaluate('one plus two')).toThrow('Invalid input');
});
