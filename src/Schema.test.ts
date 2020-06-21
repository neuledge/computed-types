import 'mocha';
import { assert, use } from 'chai';
import { typeCheck } from './schema/utils';
import chaiAsPromised from 'chai-as-promised';
import Schema from './Schema';
import { ValidationError } from './schema/errors';

use(chaiAsPromised);

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Schema', () => {
  describe('()', () => {
    it('validate string', () => {
      const validator = Schema('foo' as const);

      typeCheck<typeof validator, (x: 'foo') => 'foo'>('ok');
      assert.equal(validator('foo'), 'foo');
      assert.throw(() => validator(-1 as any), ValidationError);
    });

    it('custom message', () => {
      const validator = Schema('foo' as const, 'test error');

      assert.throw(() => validator(-1 as any), ValidationError, 'test error');
    });

    it('transform validator', () => {
      const validator = Schema('foo' as const).transform((str) =>
        str.toUpperCase(),
      );

      typeCheck<typeof validator, (x: 'foo') => string>('ok');
      assert.equal(validator('foo'), 'FOO');
      assert.throw(() => validator(-1 as any), ValidationError);
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
      const validator = Schema.merge(
        { foo: 'foo' as const },
        { bar: 1 as const },
      );

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

  describe('.enum', () => {
    it('Numbers', () => {
      enum Numbers {
        X,
        Y,
        Z,
      }

      const validator = Schema.enum(Numbers);

      typeCheck<typeof validator, (x: Numbers) => Numbers>('ok');

      assert.equal(validator(Numbers.X), Numbers.X);
      assert.equal(validator(0), 0);
      assert.equal(validator(1), 1);
      assert.equal(validator(2), 2);

      assert.throw(() => validator(3), ValidationError);
      assert.throw(() => validator(-1), ValidationError);
      assert.throw(() => validator('1' as any), ValidationError);
    });

    it('Strings', () => {
      enum Strings {
        Foo = 'foo',
        Bar = 'Bar',
      }

      const validator = Schema.enum(Strings);

      typeCheck<typeof validator, (x: Strings) => Strings>('ok');

      assert.equal(validator(Strings.Foo), Strings.Foo);
      assert.equal(validator(Strings.Bar), Strings.Bar);
      assert.equal(validator('foo' as any), 'foo');

      assert.throw(() => validator('Foo' as any), ValidationError);
      assert.throw(() => validator(0 as any), ValidationError);
    });

    it('Mixed', () => {
      enum Mixed {
        Foo = 'foo',
        Bar = 1,
      }

      const validator = Schema.enum(Mixed, 'test');

      typeCheck<typeof validator, (x: Mixed) => Mixed>('ok');

      assert.equal(validator(Mixed.Foo), Mixed.Foo);
      assert.equal(validator(Mixed.Bar), Mixed.Bar);

      assert.throw(() => validator('Foo' as any), ValidationError, 'test');
      assert.throw(() => validator(0 as any), ValidationError, 'test');
    });
  });
});
