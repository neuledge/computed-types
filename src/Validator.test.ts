import 'mocha';
import { assert, use } from 'chai';
import { typeCheck } from './schema/utils';
import Validator from './Validator';

import chaiAsPromised from 'chai-as-promised';
use(chaiAsPromised);

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Validator', () => {
  describe('positiveNumber', () => {
    const positiveNumber = new Validator((number: number): number => {
      if (typeof number !== 'number') {
        throw new TypeError('Expected type to be number');
      }

      if (number <= 0) {
        throw new RangeError(`Expected number to be positive`);
      }

      return number;
    }).proxy();

    it('Types', () => {
      typeCheck<ReturnType<typeof positiveNumber>, number>('ok');
      typeCheck<Parameters<typeof positiveNumber>, [number]>('ok');
    });

    it('()', () => {
      const res = positiveNumber(1);
      typeCheck<typeof res, number>('ok');

      assert.equal(positiveNumber(1), 1);
      assert.equal(positiveNumber(100), 100);

      assert.throws(() => positiveNumber(0), RangeError);
      assert.throws(() => positiveNumber(-6), RangeError);
      assert.throws(() => positiveNumber(undefined as any), TypeError);
      assert.throws(() => positiveNumber(null as any), TypeError);
      assert.throws(() => positiveNumber({} as any), TypeError);
      assert.throws(() => positiveNumber('5' as any), TypeError);
    });

    it('.test()', () => {
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

    it('.test().test()', () => {
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

      assert.throws(
        () => first.test((num): boolean => num > 10)(100),
        TypeError,
      );

      assert.equal(first(4), 4);
      assert.throws(() => first(100), TypeError);
    });

    it('.equals()', () => {
      const val = positiveNumber.equals(5);
      typeCheck<ReturnType<typeof val>, 5>('ok');
      typeCheck<Parameters<typeof val>, [number]>('ok');

      const res = positiveNumber.equals(5)(5 as 3);
      typeCheck<typeof res, 5>('ok');

      assert.equal(positiveNumber.equals(4)(4), 4);

      assert.throws(() => positiveNumber.equals(4)(5), TypeError);
      assert.throws(() => positiveNumber.equals(4)(1), TypeError);
      assert.throws(() => positiveNumber.equals(4)(0), RangeError);
      assert.throws(() => positiveNumber.equals(4)(-30), RangeError);
      assert.throws(() => positiveNumber.equals(4)('ddd' as any), TypeError);
    });

    it('.transform(string)', () => {
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

    it('.construct()', () => {
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

    describe('.optional', () => {
      it('()', () => {
        const validator = positiveNumber.optional();

        typeCheck<typeof validator, (x?: number) => number | undefined>('ok');
        assert.equal(validator(1), 1);
        assert.equal(validator(), undefined);
        assert.equal(validator(undefined), undefined);
      });

      it('(123)', () => {
        const validator = positiveNumber.optional(123);

        typeCheck<typeof validator, (x?: number) => number>('ok');
        assert.equal(validator(1), 1);
        assert.equal(validator(), 123);
        assert.equal(validator(undefined), 123);
      });
    });

    it('.destruct()', () => {
      const validator = positiveNumber.destruct();

      assert.deepEqual(validator(11), [null, 11]);
      assert.deepEqual(validator(40), [null, 40]);

      const res1 = validator(0);
      assert.equal(res1.length, 1);
      assert.instanceOf(res1[0], RangeError);

      const res2 = validator('foo' as any);
      assert.equal(res2.length, 1);
      assert.instanceOf(res2[0], TypeError);
    });

    it('.message(string)', () => {
      const error = 'test message';
      const validator = positiveNumber.message(error);

      assert.equal(validator(11), 11);
      assert.equal(validator(40), 40);

      assert.throws(() => validator(0), TypeError, error);
      assert.throws(() => validator('foo' as any), TypeError, error);
    });

    it('.message(Error)', () => {
      const error = new ReferenceError('my error');
      const validator = positiveNumber.message(error);

      assert.equal(validator(11), 11);
      assert.equal(validator(40), 40);

      assert.throws(() => validator(0), ReferenceError, error.message);
      assert.throws(
        () => validator('foo' as any),
        ReferenceError,
        error.message,
      );
    });

    it('.message(function)', () => {
      const validator = positiveNumber.message((input) => `error: ${input}`);

      assert.equal(validator(11), 11);
      assert.equal(validator(40), 40);

      assert.throws(() => validator(0), TypeError, 'error: 0');
      assert.throws(() => validator('foo' as any), TypeError, 'error: foo');
    });
  });

  describe('yesOrNo', () => {
    const validator = new Validator((input: 'yes' | 'no' | 'random'):
      | 'yes'
      | 'no' =>
      input === 'random' ? (Math.random() <= 0.5 ? 'yes' : 'no') : input,
    ).proxy();

    it('Types', () => {
      typeCheck<ReturnType<typeof validator>, 'yes' | 'no'>('ok');
      typeCheck<Parameters<typeof validator>, ['yes' | 'no' | 'random']>('ok');
    });

    it('(random)', () => {
      const res = validator('random');

      typeCheck<typeof res, 'yes' | 'no'>('ok');

      assert.equal(validator('yes'), 'yes');
      assert.equal(validator('no'), 'no');
      assert.match(validator('random'), /^(yes|no)$/);
    });
  });

  describe('async positiveNumber', () => {
    const positiveNumber = new Validator(
      async (number: number): Promise<number> => {
        if (typeof number !== 'number') {
          throw new TypeError('Expected type to be number');
        }

        if (number <= 0) {
          throw new RangeError(`Expected number to be positive`);
        }

        return number;
      },
    ).proxy();

    it('Types', () => {
      typeCheck<ReturnType<typeof positiveNumber>, Promise<number>>('ok');
      typeCheck<Parameters<typeof positiveNumber>, [number]>('ok');
    });

    it('.destruct()', async () => {
      const validator = positiveNumber.destruct();

      assert.deepEqual(await validator(11), [null, 11]);
      assert.deepEqual(await validator(40), [null, 40]);

      const res1 = await validator(0);
      assert.equal(res1.length, 1);
      assert.instanceOf(res1[0], RangeError);

      const res2 = await validator('foo' as any);
      assert.equal(res2.length, 1);
      assert.instanceOf(res2[0], TypeError);
    });

    it('.message(string)', async () => {
      const error = 'test message';
      const validator = positiveNumber.message(error);

      assert.equal(await validator(11), 11);
      assert.equal(await validator(40), 40);

      await assert.isRejected(validator(0));
      await assert.isRejected(validator('foo' as any));

      await assert.becomes(
        validator(0).catch((err) => err.message),
        error,
      );

      await assert.becomes(
        validator('foo' as any).catch((err) => err.message),
        error,
      );
    });
  });
});
