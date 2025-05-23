import { expect, test } from 'vitest';
import { expand, literal, synonym } from './helpfeel';

test('factor', () => {
  expect(synonym('abc')).toEqual([[['abc'], '']]);
  expect(synonym('abc(xyz|123)')).toEqual([[['abc'], '(xyz|123)']]);
  expect(synonym('abc(xyz|123)def')).toEqual([[['abc'], '(xyz|123)def']]);
  expect(synonym('(|xyz)')).toEqual([[['', 'xyz'], '']]);
});
test('synonym', () => {
  expect(synonym('abc')).toEqual([[['abc'], '']]);
  expect(synonym('abc(xyz|123)')).toEqual([[['abc'], '(xyz|123)']]);
  expect(synonym('abc(xyz|123)def')).toEqual([[['abc'], '(xyz|123)def']]);
  expect(synonym('(xyz|123)')).toEqual([[['xyz', '123'], '']]);
  expect(synonym('(xyz|123|あいう)abc')).toEqual([
    [['xyz', '123', 'あいう'], 'abc'],
  ]);
});
test('literal', () => {
  expect(literal('abc')).toEqual([[['abc'], '']]);
  expect(literal('(xyz)')).toEqual([[['xyz'], '']]);
  expect(literal('((xyz))')).toEqual([[['xyz'], '']]);
  expect(literal('(xyz|123)')).toEqual([[['xyz', '123'], '']]);
  expect(literal('abc(|xyz)')).toEqual([[['abc', 'abcxyz'], '']]);
  expect(literal('(xyz|123)abc')).toEqual([[['xyzabc', '123abc'], '']]);
  expect(literal('abc(xyz|123|あいう)')).toEqual([
    [['abcxyz', 'abc123', 'abcあいう'], ''],
  ]);
  expect(literal('abc(xyz|123)def')).toEqual([
    [['abcxyzdef', 'abc123def'], ''],
  ]);
});

test('expand', () => {
  expect(expand('abc')).toEqual(['abc']);
  expect(expand('abc(|xyz|123)')).toEqual(['abc', 'abcxyz', 'abc123']);
  expect(expand('abc(xyz|123)')).toEqual(['abcxyz', 'abc123']);
  expect(expand('abc(xyz|123)def')).toEqual(['abcxyzdef', 'abc123def']);
  expect(expand('(xyz|123)')).toEqual(['xyz', '123']);
  expect(expand('(xyz|123|あいう)')).toEqual(['xyz', '123', 'あいう']);
  expect(expand('abc(xyz|123|あいう)')).toEqual([
    'abcxyz',
    'abc123',
    'abcあいう',
  ]);
  expect(expand('abc(xyz|123)def')).toEqual(['abcxyzdef', 'abc123def']);
  expect(expand('abc(xyz|123)def(abc|xyz)')).toEqual([
    'abcxyzdefabc',
    'abcxyzdefxyz',
    'abc123defabc',
    'abc123defxyz',
  ]);
  expect(() => expand('')).toThrow('Invalid input');
  expect(() => expand('abc|xyz')).toThrow('Unused input');
  expect(() => expand('(|xyz)')).toReturn;
  expect(() => expand('(xyz|)')).toThrow('Invalid input');
});
