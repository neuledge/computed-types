import 'mocha';
import { assert } from 'chai';
import Validator from './Validator';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Validator', () => {
  const positiveNumber = Validator.proxy((number: number): number => {
    if (typeof number !== 'number') {
      throw new TypeError('Expected type to be number');
    }

    if (number <= 0) {
      throw new RangeError(`Expected number to be positive`);
    }

    return number;
  });

  it('positiveNumber()', () => {
    assert.equal(positiveNumber(1), 1);
    assert.equal(positiveNumber(100), 100);

    assert.throws(() => positiveNumber(0), RangeError);
    assert.throws(() => positiveNumber(-6), RangeError);
    assert.throws(() => positiveNumber(undefined as any), TypeError);
    assert.throws(() => positiveNumber(null as any), TypeError);
    assert.throws(() => positiveNumber({} as any), TypeError);
    assert.throws(() => positiveNumber('5' as any), TypeError);
  });

  it('positiveNumber.test()', () => {
    assert.equal(positiveNumber.test((num): boolean => num < 100)(4), 4);
    assert.equal(positiveNumber.test((num): boolean => num < 100)(99), 99);

    assert.throws(
      () => positiveNumber.test((num): boolean => num < 100)(100),
      TypeError,
    );
    assert.throws(
      () => positiveNumber.test((num): boolean => num < 100)(0),
      RangeError,
    );
    assert.throws(
      () => positiveNumber.test((num): boolean => num < 100)('ddd' as any),
      TypeError,
    );
  });

  it('positiveNumber.test().test()', () => {
    const first = positiveNumber.test((num): boolean => num < 100);

    assert.equal(first(4), 4);
    assert.equal(first(99), 99);

    assert.throws(() => first(100), TypeError);
    assert.throws(() => first(0), RangeError);
    assert.throws(() => first('ddd' as any), TypeError);

    const second = first.test((num): boolean => num > 10);

    assert.equal(second(11), 11);
    assert.equal(second(40), 40);

    assert.throws(() => second(100), TypeError);
    assert.throws(() => second(9), TypeError);
    assert.throws(() => second(0), RangeError);
    assert.throws(() => second('ddd' as any), TypeError);

    assert.throws(() => first.test((num): boolean => num > 10)(100), TypeError);

    assert.equal(first(4), 4);
    assert.throws(() => first(100), TypeError);
  });

  it('positiveNumber.equals()', () => {
    assert.equal(positiveNumber.equals(4)(4), 4);

    assert.throws(() => positiveNumber.equals(4)(5), TypeError);
    assert.throws(() => positiveNumber.equals(4)(1), TypeError);
    assert.throws(() => positiveNumber.equals(4)(0), RangeError);
    assert.throws(() => positiveNumber.equals(4)(-30), RangeError);
    assert.throws(() => positiveNumber.equals(4)('ddd' as any), TypeError);
  });

  it('positiveNumber.transform(string)', () => {
    const validator = positiveNumber.transform((input): string => {
      if (input === 1000) {
        throw new ReferenceError('fail');
      }

      return `${-input}`;
    });

    assert.equal(validator(11), '-11');
    assert.equal(validator(40), '-40');

    assert.throws(() => validator(0), RangeError);
    assert.throws(() => validator(-9), RangeError);
    assert.throws(() => validator(1000), ReferenceError, 'fail');
  });

  it('positiveNumber.construct()', () => {
    const validator = positiveNumber.construct((input: unknown) => {
      if (input === 'error') {
        throw new ReferenceError('error');
      }

      return [Number(input || 0)];
    });

    assert.equal(validator(11), 11);
    assert.equal(validator(40), 40);
    assert.equal(validator('12'), 12);
    assert.equal(validator('12.4'), 12.4);
    assert.isNaN(validator('foo'));

    assert.throws(() => validator(null), RangeError);
    assert.throws(() => validator(undefined), RangeError);
    assert.throws(() => validator('error'), ReferenceError);
  });

  it('positiveNumber.message(string)', () => {
    const error = 'test message';
    const validator = positiveNumber.message(error);

    assert.equal(validator(11), 11);
    assert.equal(validator(40), 40);

    assert.throws(() => validator(0), TypeError, error);
    assert.throws(() => validator('foo' as any), TypeError, error);
  });

  it('positiveNumber.message(Error)', () => {
    const error = new ReferenceError('my error');
    const validator = positiveNumber.message(error);

    assert.equal(validator(11), 11);
    assert.equal(validator(40), 40);

    assert.throws(() => validator(0), ReferenceError, error.message);
    assert.throws(() => validator('foo' as any), ReferenceError, error.message);
  });

  it('positiveNumber.message(function)', () => {
    const validator = positiveNumber.message((input) => `error: ${input}`);

    assert.equal(validator(11), 11);
    assert.equal(validator(40), 40);

    assert.throws(() => validator(0), TypeError, 'error: 0');
    assert.throws(() => validator('foo' as any), TypeError, 'error: foo');
  });
});
