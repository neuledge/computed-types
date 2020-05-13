import 'mocha';
import { assert, use } from 'chai';
import { typeCheck } from './schema/utils';
import chaiAsPromised from 'chai-as-promised';
import Schema from './Schema';

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
    it('[sync,async] candidates', async () => {
      const validator = Schema.either(
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

      const trans = validator.transform((str): string => str + '-foo');
      typeCheck<
        typeof trans,
        (x: number | boolean) => string | PromiseLike<string>
      >('ok');

      await assert.equal(trans(1) as string, '1-foo');
      await assert.becomes(trans(false) as PromiseLike<string>, '0-foo');
      await assert.isRejected(trans(-1) as PromiseLike<string>);
    });
  });

  describe('.merge', () => {
    it('basic use case', () => {
      const validator = Schema.merge({ foo: 'foo' as 'foo' }, { bar: 1 as 1 });

      typeCheck<
        typeof validator,
        (x: { foo: 'foo'; bar: 1 }) => { foo: 'foo'; bar: 1 }
      >('ok');
      assert.deepEqual(validator({ foo: 'foo', bar: 1 }), {
        foo: 'foo',
        bar: 1,
      });

      const trans = validator.transform((obj) => Object.keys(obj));
      typeCheck<typeof trans, (x: { foo: 'foo'; bar: 1 }) => string[]>('ok');

      assert.deepEqual(trans({ foo: 'foo', bar: 1 }), ['foo', 'bar']);
    });
  });
});
