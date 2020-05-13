import 'mocha';
import { assert } from 'chai';
import string from './string';
import { typeCheck } from './schema/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('string', () => {
  it('string()', () => {
    assert.equal(string('foo'), 'foo');
    assert.equal(string('foo '), 'foo ');
    assert.equal(string(' foo '), ' foo ');
    assert.equal(string(' '), ' ');
    assert.equal(string(''), '');

    assert.throws(() => string(null as any), TypeError);
    assert.throws(() => string(undefined as any), TypeError);
    assert.throws(() => string({} as any), TypeError);
    assert.throws(() => string({ foo: 1 } as any), TypeError);
    assert.throws(() => string(122 as any), TypeError);
    assert.throws(() => string(true as any), TypeError);
    assert.throws(() => string(false as any), TypeError);
  });

  it('.toLowerCase()', () => {
    assert.equal(string.toLowerCase()('Foo'), 'foo');
    assert.equal(string.toLowerCase()('foo'), 'foo');
    assert.equal(string.toLowerCase()(' fOo '), ' foo ');
  });

  it('.toUpperCase()', () => {
    assert.equal(string.toUpperCase()('Foo'), 'FOO');
    assert.equal(string.toUpperCase()('foo'), 'FOO');
    assert.equal(string.toUpperCase()(' fOo '), ' FOO ');
  });

  it('.toLocaleLowerCase()', () => {
    assert.equal(string.toLocaleLowerCase()('İstanbul'), 'i̇stanbul');
    assert.equal(string.toLocaleLowerCase('en-US')('İstanbul'), 'i̇stanbul');
    assert.equal(string.toLocaleLowerCase('TR')('İstanbul'), 'istanbul');
  });

  it('.toLocaleUpperCase()', () => {
    assert.equal(string.toLocaleUpperCase()('istanbul'), 'ISTANBUL');
    assert.equal(string.toLocaleUpperCase('en-US')('istanbul'), 'ISTANBUL');
    assert.equal(string.toLocaleUpperCase('TR')('istanbul'), 'İSTANBUL');
  });

  it('.normalize()', () => {
    const name1 = '\u0041\u006d\u00e9\u006c\u0069\u0065';
    const name2 = '\u0041\u006d\u0065\u0301\u006c\u0069\u0065';

    assert.equal(string.normalize()(name1), 'Amélie');
    assert.equal(string.normalize()(name2), 'Amélie');
  });

  it('.trim()', () => {
    assert.equal(string.trim()('foo'), 'foo');
    assert.equal(string.trim()('foo '), 'foo');
    assert.equal(string.trim()(' foo\n\nbar '), 'foo\n\nbar');

    assert.throws(() => string.trim()(false as any), TypeError);
  });

  it('.trim().toLowerCase()', () => {
    assert.equal(string.trim().toLowerCase()(' Foo  '), 'foo');
    assert.equal(string.toLowerCase().trim()(' Fo o  '), 'fo o');
  });

  it('.min()', () => {
    assert.equal(string.min(1)('foo'), 'foo');
    assert.equal(string.min(1)('a'), 'a');

    assert.throws(() => string.min(1)(''), RangeError);
    assert.throws(() => string.min(2)('a'), RangeError);
    assert.throws(() => string.min(2)(null as any), TypeError);
    assert.throws(() => string.min(2, 'test')('a'), TypeError, 'test');
  });

  it('.max()', () => {
    assert.equal(string.max(2)('ab'), 'ab');
    assert.equal(string.max(2)('a'), 'a');
    assert.equal(string.max(2)(''), '');

    assert.throws(() => string.max(2)('abc'), RangeError);
    assert.throws(() => string.max(2)(null as any), TypeError);
    assert.throws(() => string.max(2, 'test')('abc'), TypeError, 'test');
  });

  it('.between()', () => {
    assert.equal(string.between(1, 3)('ab'), 'ab');
    assert.equal(string.between(1, 3)('abc'), 'abc');
    assert.equal(string.between(1, 3)('a'), 'a');
    assert.equal(string.between(3, 3)('abc'), 'abc');

    assert.throws(() => string.between(1, 3)(''), RangeError);
    assert.throws(() => string.between(3, 3)('ab'), RangeError);
    assert.throws(() => string.between(3, 3)('abcd'), RangeError);
    assert.throws(() => string.between(1, 3)(null as any), TypeError);
    assert.throws(() => string.between(1, 3, 'test')(''), TypeError, 'test');
  });

  it('.regexp()', () => {
    assert.equal(string.regexp(/^foo$/i)('Foo'), 'Foo');
    assert.equal(string.regexp(/^foo$/i)('foo'), 'foo');

    assert.throws(() => string.regexp(/^foo$/i)(' foo'), TypeError);
    assert.throws(() => string.regexp(/^foo$/i)(''), TypeError);
    assert.throws(() => string.regexp(/^foo$/i, 'test')(''), TypeError, 'test');
    assert.throws(() => string.regexp(/^foo$/i)(null as any), TypeError);
  });

  it('name use case', () => {
    const validator = string.trim().normalize().between(3, 40).optional();

    typeCheck<Parameters<typeof validator>, [string?]>('ok');
    typeCheck<[ReturnType<typeof validator>], [string | undefined]>('ok');

    assert.equal(validator('John Doe'), 'John Doe');
    assert.equal(validator('John Doe '), 'John Doe');
    assert.equal(validator(), undefined);

    assert.throws(() => validator('av    '), RangeError);
  });
});
