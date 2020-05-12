import 'mocha';
import { assert, use } from 'chai';
import { typeCheck } from './utils';
import { either, optional } from './logic';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('schema/logic', () => {
  describe('either', () => {
    it('sync candidate', () => {
      const validator = either((x: number): string => {
        if (x <= 0) {
          throw new RangeError(`Negative input`);
        }

        return String(x);
      });

      typeCheck<typeof validator, (x: number) => string>('ok');
      assert.equal(validator(1), '1');
      assert.throw(() => validator(-1), RangeError, 'Negative input');
    });

    it('async candidate', async () => {
      const validator = either(
        async (x: number): Promise<string> => {
          if (x <= 0) {
            throw new RangeError(`Negative input`);
          }

          return String(x);
        },
      );

      typeCheck<typeof validator, (x: number) => PromiseLike<string>>('ok');

      await assert.isFulfilled(validator(1));
      await assert.isRejected(validator(-1));
      await assert.becomes(validator(1), '1');
    });

    it('2 sync candidates', () => {
      const validator = either(
        (x: number): string => {
          if (typeof x !== 'number' || x <= 0) {
            throw new RangeError(`Negative input`);
          }

          return String(x);
        },
        (x: boolean): number => {
          if (typeof x !== 'boolean') {
            throw new RangeError(`Non boolean`);
          }

          return x ? 1 : 0;
        },
      );

      typeCheck<typeof validator, (x: number | boolean) => string | number>(
        'ok',
      );
      assert.equal(validator(1), '1');
      assert.equal(validator(false), 0);
      assert.throw(() => validator('' as any), RangeError, 'Non boolean');
    });

    it('[sync,async] candidates', async () => {
      const validator = either(
        (x: number): string => {
          if (typeof x !== 'number' || x <= 0) {
            throw new RangeError(`Negative input`);
          }

          return String(x);
        },
        async (x: boolean): Promise<number> => {
          if (typeof x !== 'boolean') {
            throw new RangeError(`Non boolean`);
          }

          return x ? 1 : 0;
        },
      );

      typeCheck<
        typeof validator,
        (x: number | boolean) => string | PromiseLike<number>
      >('ok');
      assert.equal(validator(1), '1');
      await assert.becomes(validator(true) as PromiseLike<number>, 1);
      await assert.isRejected(validator('' as any) as any);
    });
  });

  describe('optional', () => {
    it('string', () => {
      const validator = optional('foo' as 'foo');

      typeCheck<typeof validator, (x?: 'foo') => 'foo' | undefined>('ok');
      assert.equal(validator(), undefined);
      assert.equal(validator(undefined), undefined);
      assert.equal(validator('foo'), 'foo');
      assert.throw(() => validator(null as any), TypeError);
      assert.throw(() => validator(-1 as any), TypeError);
    });

    it('function', () => {
      const validator = optional((x: number): string => {
        if (x <= 0) {
          throw new RangeError(`Negative input`);
        }

        return String(x);
      });

      typeCheck<typeof validator, (x?: number) => string | undefined>('ok');
      assert.equal(validator(1), '1');
      assert.equal(validator(), undefined);
      assert.equal(validator(undefined), undefined);
      assert.throw(() => validator(null as any), RangeError, 'Negative input');
      assert.throw(() => validator(-1), RangeError, 'Negative input');
    });
  });
});
