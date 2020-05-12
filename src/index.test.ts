import 'mocha';
import { assert, use } from 'chai';
import { typeCheck } from './schema/utils';
import chaiAsPromised from 'chai-as-promised';
import Schema from './index';

use(chaiAsPromised);

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Schema', () => {
  describe('()', () => {
    it('validate string', () => {
      const validator = Schema('foo' as 'foo');

      typeCheck<typeof validator, (x: 'foo') => 'foo'>('ok');
      assert.equal(validator('foo'), 'foo');
      assert.throw(() => validator(-1 as any), TypeError);
    });

    it('custom message', () => {
      const validator = Schema('foo' as 'foo', 'test error');

      assert.throw(() => validator(-1 as any), TypeError, 'test error');
    });

    it('transform validator', () => {
      const validator = Schema('foo' as 'foo').transform((str) =>
        str.toUpperCase(),
      );

      typeCheck<typeof validator, (x: 'foo') => string>('ok');
      assert.equal(validator('foo'), 'FOO');
      assert.throw(() => validator(-1 as any), TypeError);
    });
  });

  describe('.either', () => {
    it('sync candidate', () => {
      const validator = Schema.either((x: number): string => {
        if (x <= 0) {
          throw new RangeError(`Negative input`);
        }

        return String(x);
      });

      typeCheck<typeof validator, (x: number) => string>('ok');
      assert.equal(validator(1), '1');
      assert.throw(() => validator(-1), RangeError, 'Negative input');

      const trans = validator.transform((str) => str.length);
      typeCheck<typeof trans, (x: number) => number>('ok');
      assert.equal(trans(1), 1);
      assert.throw(() => validator(-1), RangeError, 'Negative input');
    });

    it('async candidate', async () => {
      const validator = Schema.either(
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

      const trans = validator.transform(async (str) => (await str).length);
      typeCheck<typeof trans, (x: number) => Promise<number>>('ok');
      await assert.becomes(trans(1), 1);
      await assert.isRejected(trans(-1));
    });
  });
});
