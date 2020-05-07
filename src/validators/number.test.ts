import 'mocha';
import { assert } from 'chai';
import number from './number';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('number', () => {
  it('number()', () => {
    assert.equal(number(123), 123);
    assert.equal(number(12.3), 12.3);
    assert.equal(number(-12.3), -12.3);
    assert.equal(number(0), 0);
    assert.isNaN(number(NaN));
    assert.equal(number(Number.EPSILON), Number.EPSILON);
    assert.equal(number(Number.MAX_VALUE), Number.MAX_VALUE);
    assert.equal(number(Number.MIN_VALUE), Number.MIN_VALUE);
    assert.equal(number(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
    assert.equal(number(Number.MIN_SAFE_INTEGER), Number.MIN_SAFE_INTEGER);
    assert.equal(number(Number.POSITIVE_INFINITY), Number.POSITIVE_INFINITY);
    assert.equal(number(Number.NEGATIVE_INFINITY), Number.NEGATIVE_INFINITY);

    assert.throws(() => number('12.3' as any), TypeError);
    assert.throws(() => number('hello' as any), TypeError);
    assert.throws(() => number('hello' as any), TypeError);
    assert.throws(() => number('2 3' as any), TypeError);
    assert.throws(() => number(undefined as any), TypeError);
    assert.throws(() => number(null as any), TypeError);
    assert.throws(() => number(true as any), TypeError);
    assert.throws(() => number(false as any), TypeError);
  });

  it('number.float()', () => {
    assert.equal(number.float()(123), 123);
    assert.equal(number.float()(12.3), 12.3);
    assert.equal(number.float()(-12.3), -12.3);
    assert.equal(number.float()(0), 0);
    assert.equal(number.float()(Number.EPSILON), Number.EPSILON);
    assert.equal(number.float()(Number.MAX_VALUE), Number.MAX_VALUE);
    assert.equal(number.float()(Number.MIN_VALUE), Number.MIN_VALUE);

    assert.throws(() => number.float()(NaN), TypeError);
    assert.throws(() => number.float()(Number.POSITIVE_INFINITY), TypeError);
    assert.throws(() => number.float()(Number.NEGATIVE_INFINITY), TypeError);
    assert.throws(() => number.float()('12.3' as any), TypeError);
  });

  it('number.integer()', () => {
    assert.equal(number.integer()(123), 123);
    assert.equal(number.integer()(0), 0);
    assert.equal(number.integer()(-3), -3);

    assert.throws(() => number.integer()(undefined as any), TypeError);
    assert.throws(() => number.integer()(null as any), TypeError);
    assert.throws(() => number.integer()(NaN), TypeError);
    assert.throws(() => number.integer()(Number.POSITIVE_INFINITY), TypeError);
    assert.throws(() => number.integer()(1.23), TypeError);
    assert.throws(() => number.integer()(-1.23), TypeError);
    assert.throws(() => number.integer()('12.3' as any), TypeError);
    assert.throws(() => number.integer()('hello' as any), TypeError);
  });

  // TODO add more tests
});
