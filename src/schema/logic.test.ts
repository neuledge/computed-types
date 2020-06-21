import 'mocha';
import { assert, use } from 'chai';
import { typeCheck } from './utils';
import { merge, either, optional } from './logic';
import chaiAsPromised from 'chai-as-promised';
import string from '../string';
import number from '../number';
import { ValidationError } from './errors';

use(chaiAsPromised);

/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-types */

describe('schema/logic', () => {
  describe('either', () => {
    it('no candidates', () => {
      assert.throw(() => either(...(([] as unknown) as [unknown])), RangeError);
    });

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

    it('[async,async] candidates', async () => {
      const validator = either(
        async (x: number): Promise<string> => {
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
        (x: number | boolean) => PromiseLike<string> | PromiseLike<number>
      >('ok');
      await assert.becomes(validator(1), '1');
      await assert.becomes(validator(true), 1);
      await assert.isRejected(validator('' as any) as any);
    });

    it('use switch', () => {
      const validator = either(
        { type: 'foo' as const, foo: number },
        { type: 'bar' as const, bar: string },
      );

      typeCheck<
        typeof validator,
        (
          x: { type: 'foo'; foo: number } | { type: 'bar'; bar: string },
        ) => { type: 'foo'; foo: number } | { type: 'bar'; bar: string }
      >('ok');

      assert.deepEqual(validator({ type: 'foo', foo: 2 }), {
        type: 'foo',
        foo: 2,
      });
      assert.deepEqual(validator({ type: 'bar', bar: 'hello' }), {
        type: 'bar',
        bar: 'hello',
      });

      assert.throw(
        () => validator({ type: 'foo', foo: 'dd' } as any),
        ValidationError,
        'foo: Expect value to be "number"',
      );

      assert.throw(
        () => validator({ type: 'bar', foo: 'dd' } as any),
        ValidationError,
        'bar: Expect value to be "string"',
      );

      assert.throw(
        () => validator({ type: 'hello', foo: 'dd' } as any),
        ValidationError,
        'type: Expect value to equal "foo"',
      );
    });
  });

  describe('merge', () => {
    it('no items', () => {
      assert.throw(() => merge(...(([] as unknown) as [unknown])), RangeError);
    });

    it('one item', () => {
      const validator = merge('foo' as const);

      typeCheck<typeof validator, (x: 'foo') => 'foo'>('ok');
      assert.equal(validator('foo'), 'foo');
      assert.throw(() => validator('bar' as any), ValidationError);
    });

    it('never string items', () => {
      const validator = merge('foo' as const, 'bar' as const);

      typeCheck<typeof validator, (x: never) => never>('ok');
      assert.throw(() => validator('foo' as never), ValidationError);
      assert.throw(() => validator('bar' as never), ValidationError);
    });

    it('never [string,object] items', () => {
      const validator = merge('foo' as const, {});

      typeCheck<typeof validator, (x: 'foo' & {}) => 'foo' & {}>('ok');
      assert.throw(() => validator('foo'), ValidationError);
      assert.throw(() => validator({} as any), ValidationError);
      assert.throw(() => validator('bar' as never), ValidationError);
    });

    it('never [object,undefined] items', () => {
      const validator = merge({}, undefined);

      typeCheck<typeof validator, (x: never) => never>('ok');
      assert.throw(() => validator(undefined as never), ValidationError);
      assert.throw(() => validator({} as never), ValidationError);
      assert.throw(() => validator('bar' as never), ValidationError);
    });

    it('merging object [string,object] items', () => {
      const validator = merge({}, { foo: 'bar' as const });

      typeCheck<typeof validator, (x: { foo: 'bar' }) => { foo: 'bar' }>('ok');
      assert.deepEqual(validator({ foo: 'bar' }), { foo: 'bar' });
      assert.deepEqual(validator({ foo: 'bar', x: 1 } as any), { foo: 'bar' });
      assert.throw(() => validator({} as any), ValidationError);
      assert.throw(() => validator(undefined as any), ValidationError);
    });

    it('merging functions', () => {
      const validator = merge(
        (o: { x: number }) => ({
          x: String(o.x),
        }),
        (o: { y?: number }) => ({
          y: String((o.y || 0) + 1),
        }),
      );

      typeCheck<
        typeof validator,
        (x: { x: number; y?: number }) => { x: string; y: string }
      >('ok');
      assert.deepEqual(validator({ x: 1, y: 2 }), { x: '1', y: '3' });
      assert.deepEqual(validator({ x: 1 }), { x: '1', y: '1' });
    });

    it('merging [sync, async]', async () => {
      const validator = merge(
        (n: number) => n + 1,
        (n: number) =>
          n > 0
            ? Promise.resolve(n + 1)
            : Promise.reject(new Error('negative')),
      );

      typeCheck<typeof validator, (x: number) => PromiseLike<number>>('ok');

      await assert.isFulfilled(validator(2));
      await assert.isRejected(validator(-1), 'negative');

      assert.equal(await validator(2), 3);
      assert.equal(await validator(6), 7);
    });
  });

  describe('optional', () => {
    it('function', () => {
      const validator = optional((x: number): string => {
        if (x <= 0) {
          throw new RangeError(`Negative input`);
        }

        return String(x);
      });

      typeCheck<typeof validator, (x?: number | null) => string | undefined>(
        'ok',
      );
      assert.equal(validator(1), '1');
      assert.equal(validator(), undefined);
      assert.equal(validator(undefined), undefined);
      assert.equal(validator(null), undefined);
      assert.equal(validator('' as any), undefined);
      assert.throw(() => validator(false as any), RangeError, 'Negative input');
      assert.throw(() => validator(0), RangeError, 'Negative input');
      assert.throw(() => validator(-1), RangeError, 'Negative input');
    });
  });
});
