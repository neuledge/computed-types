import 'mocha';
import { assert } from 'chai';
import object from './object';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('object', () => {
  it('object()', () => {
    const empty = {};
    const fooObj = { foo: 1 };
    const arr: unknown[] = [];
    const fooArr = ['foo'];

    assert.equal(object(empty), empty);
    assert.equal(object(fooObj), fooObj);
    assert.equal(object(arr), arr);
    assert.equal(object(fooArr), fooArr);

    assert.throws(() => object(null as any), TypeError);
    assert.throws(() => object(0 as any), TypeError);
    assert.throws(() => object(1 as any), TypeError);
    assert.throws(() => object('hello' as any), TypeError);
    assert.throws(() => object(true as any), TypeError);
    assert.throws(() => object(false as any), TypeError);
    assert.throws(() => object(Symbol('test') as any), TypeError);
    assert.throws(() => object(undefined as any), TypeError);
  });
});
