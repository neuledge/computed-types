import 'mocha';
import { assert } from 'chai';
import number from './number';
import { ValidationError } from './schema/errors';

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

    assert.throws(() => number('12.3' as any), ValidationError);
    assert.throws(() => number('hello' as any), ValidationError);
    assert.throws(() => number('hello' as any), ValidationError);
    assert.throws(() => number('2 3' as any), ValidationError);
    assert.throws(() => number(undefined as any), ValidationError);
    assert.throws(() => number(null as any), ValidationError);
    assert.throws(() => number(true as any), ValidationError);
    assert.throws(() => number(false as any), ValidationError);
  });

  it('.float()', () => {
    assert.equal(number.float()(123), 123);
    assert.equal(number.float()(12.3), 12.3);
    assert.equal(number.float()(-12.3), -12.3);
    assert.equal(number.float()(0), 0);
    assert.equal(number.float()(Number.EPSILON), Number.EPSILON);
    assert.equal(number.float()(Number.MAX_VALUE), Number.MAX_VALUE);
    assert.equal(number.float()(Number.MIN_VALUE), Number.MIN_VALUE);

    assert.throws(() => number.float()(NaN), ValidationError);
    assert.throws(
      () => number.float()(Number.POSITIVE_INFINITY),
      ValidationError,
    );
    assert.throws(
      () => number.float()(Number.NEGATIVE_INFINITY),
      ValidationError,
    );
    assert.throws(() => number.float()('12.3' as any), ValidationError);
  });

  it('.integer()', () => {
    assert.equal(number.integer()(123), 123);
    assert.equal(number.integer()(0), 0);
    assert.equal(number.integer()(-3), -3);

    assert.throws(() => number.integer()(undefined as any), ValidationError);
    assert.throws(() => number.integer()(null as any), ValidationError);
    assert.throws(() => number.integer()(NaN), ValidationError);
    assert.throws(
      () => number.integer()(Number.POSITIVE_INFINITY),
      ValidationError,
    );
    assert.throws(() => number.integer()(1.23), ValidationError);
    assert.throws(() => number.integer()(-1.23), ValidationError);
    assert.throws(() => number.integer()('12.3' as any), ValidationError);
    assert.throws(() => number.integer()('hello' as any), ValidationError);
  });

  it('.toExponential()', () => {
    assert.equal(number.toExponential()(1234), '1.234e+3');
  });

  it('.toExponential().toUpperCase()', () => {
    assert.equal(number.toExponential().toUpperCase()(1234), '1.234E+3');
  });

  it('.toFixed()', () => {
    assert.equal(number.toFixed(1)(12.34), '12.3');
  });

  it('.toLocaleString()', () => {
    assert.equal(number.toLocaleString()(1234), '1,234');
    assert.equal(number.toLocaleString('en-US')(1234), '1,234');
  });

  it('.toPrecision()', () => {
    assert.equal(number.toPrecision()(123.456), '123.456');
    assert.equal(number.toPrecision(2)(123.456), '1.2e+2');
    assert.equal(number.toPrecision(3)(123.456), '123');
  });

  it('.toString()', () => {
    assert.equal(number.toString()(123.456), '123.456');
    assert.equal(number.toString(16)(123.456), '7b.74bc6a7ef9dc');
  });

  it('.min()', () => {
    assert.equal(number.min(3)(3), 3);
    assert.equal(number.min(3)(3.5), 3.5);

    assert.throw(() => number.min(3)(2.9), RangeError);
    assert.throw(() => number.min(3)(NaN), RangeError);
    assert.throw(() => number.min(3)(null as any), ValidationError);
    assert.throw(() => number.min(3, 'test')(1), ValidationError, 'test');
  });

  it('.max()', () => {
    assert.equal(number.max(3)(3), 3);
    assert.equal(number.max(3)(2.9), 2.9);

    assert.throw(() => number.max(3)(4.1), RangeError);
    assert.throw(() => number.max(3)(NaN), RangeError);
    assert.throw(() => number.max(3)(null as any), ValidationError);
    assert.throw(() => number.max(3, 'test')(6), ValidationError, 'test');
  });

  it('.gte()', () => {
    assert.equal(number.gte(3)(3), 3);
    assert.equal(number.gte(3)(3.1), 3.1);

    assert.throw(() => number.gte(3)(2.9), RangeError);
  });

  it('.lte()', () => {
    assert.equal(number.lte(3)(3), 3);
    assert.equal(number.lte(3)(2.9), 2.9);

    assert.throw(() => number.lte(3)(3.1), RangeError);
  });

  it('.gt()', () => {
    assert.equal(number.gt(3)(3.1), 3.1);

    assert.throw(() => number.gt(3)(3), RangeError);
    assert.throw(() => number.gt(3)(NaN), RangeError);
    assert.throw(() => number.gt(3)(2.9), RangeError);
    assert.throw(() => number.gt(3, 'test')(2.9), ValidationError, 'test');
  });

  it('.lt()', () => {
    assert.equal(number.lt(3)(2.9), 2.9);

    assert.throw(() => number.lt(3)(3), RangeError);
    assert.throw(() => number.lt(3)(NaN), RangeError);
    assert.throw(() => number.lt(3)(3.1), RangeError);
    assert.throw(() => number.lt(3, 'test')(3.1), ValidationError, 'test');
  });

  it('.between()', () => {
    assert.equal(number.between(1, 3)(1), 1);
    assert.equal(number.between(1, 3)(1.5), 1.5);
    assert.equal(number.between(1, 3)(3), 3);

    assert.throw(() => number.between(1, 3)(0.9), RangeError);
    assert.throw(() => number.between(1, 3)(3.1), RangeError);
    assert.throw(() => number.between(1, 3)(NaN), RangeError);
    assert.throw(
      () => number.between(1, 3, 'test')(NaN),
      ValidationError,
      'test',
    );
  });
});
