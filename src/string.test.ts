import 'mocha';
import { assert } from 'chai';
import string from './string';

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

  it('string.trim()', () => {
    assert.equal(string.trim()('foo'), 'foo');
    assert.equal(string.trim()('foo '), 'foo');
    assert.equal(string.trim()(' foo\n\nbar '), 'foo\n\nbar');

    assert.throws(() => string.trim()(false as any), TypeError);
  });

  it('string.toLowerCase()', () => {
    assert.equal(string.toLowerCase()('Foo'), 'foo');
    assert.equal(string.toLowerCase()('foo'), 'foo');
    assert.equal(string.toLowerCase()(' fOo '), ' foo ');
  });

  it('string.trim().toLowerCase()', () => {
    assert.equal(string.trim().toLowerCase()(' Foo  '), 'foo');
    assert.equal(string.toLowerCase().trim()(' Fo o  '), 'fo o');
  });

  // TODO add more tests
});
