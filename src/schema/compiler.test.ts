import 'mocha';
import { assert, use } from 'chai';
import { typeCheck } from './utils';
import compiler from './compiler';
import chaiAsPromised from 'chai-as-promised';
import { ValidationError } from './errors';

use(chaiAsPromised);

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('schema', () => {
  describe('compiler', () => {
    it('exact string', () => {
      const validator = compiler('string' as const);
      typeCheck<typeof validator, (x: 'string') => 'string'>('ok');

      const ret = validator('string');
      typeCheck<[typeof ret], ['string']>('ok');
      assert.equal(ret, 'string');

      assert.throw(() => validator('foo' as 'string'), ValidationError);
    });

    it('exact number', () => {
      const validator = compiler(2 as const);
      typeCheck<typeof validator, (x: 2) => 2>('ok');

      const ret = validator(2);
      typeCheck<typeof ret, 2>('ok');
      assert.equal(ret, 2);

      assert.throw(() => validator(3 as 2), ValidationError);
    });

    it('number validator', () => {
      const validator = compiler((x: number) => x + 1);
      typeCheck<typeof validator, (x: number) => number>('ok');

      const ret = validator(2);
      typeCheck<typeof ret, number>('ok');
      assert.equal(ret, 3);

      assert.equal(validator(true as unknown as number), 2);
    });

    it('optional validator', () => {
      const validator = compiler((x = 0) => x + 1);
      typeCheck<typeof validator, (x?: number) => number>('ok');

      const ret = validator();
      typeCheck<typeof ret, number>('ok');
      assert.equal(ret, 1);
    });

    it('RegExp', () => {
      const validator = compiler(/^Foo/);
      typeCheck<typeof validator, (x: string) => string>('ok');

      assert.equal(validator('Foo'), 'Foo');
      assert.equal(validator('FooBar'), 'FooBar');

      assert.throws(() => validator('foo'), ValidationError);
    });

    it('object', () => {
      const validator = compiler({ foo: String, bar: Number });
      typeCheck<
        typeof validator,
        (x: { foo?: any; bar?: any }) => { foo: string; bar: number }
      >('ok');

      assert.deepEqual(validator({ foo: 'foo', bar: 123 }), {
        foo: 'foo',
        bar: 123,
      });

      assert.deepEqual(validator({ foo: null, bar: '123' }), {
        foo: 'null',
        bar: 123,
      });

      assert.throws(() => validator(123 as any), ValidationError);
    });

    it('strict mode: off', () => {
      const validator = compiler(
        { foo: 'bar' as const, bar: 123 as const },
        { strict: false },
      );

      assert.deepEqual(validator({ foo: 'bar', bar: 123 }), {
        foo: 'bar',
        bar: 123,
      });

      assert.deepEqual(validator({ foo: 'bar', bar: 123, hello: 123 } as any), {
        foo: 'bar',
        bar: 123,
      });

      assert.throws(
        () => validator({ foo: 'bar2', bar: 123, hello: 123 } as any),
        ValidationError,
      );

      assert.throws(
        () => validator({ foo: 'bar', hello: 123 } as any),
        ValidationError,
      );
    });

    it('strict mode: on', () => {
      const validator = compiler(
        { foo: 'bar' as const, bar: 123 as const },
        { strict: true },
      );

      assert.deepEqual(validator({ foo: 'bar', bar: 123 }), {
        foo: 'bar',
        bar: 123,
      });

      assert.throws(
        () => validator({ foo: 'bar', bar: 123, hello: 123 } as any),
        ValidationError,
        'Unknown property "hello"',
      );

      assert.throws(
        () => validator({ foo: 'bar2', bar: 123, hello: 123 } as any),
        ValidationError,
        'Expect value to equal "bar"',
      );

      assert.throws(
        () => validator({ foo: 'bar', hello: 123 } as any),
        ValidationError,
        'Expect value to equal "123"',
      );
    });

    it('deep object', () => {
      const validator = compiler({
        foo: String,
        bar: { hello: String, world: Boolean },
      });
      typeCheck<
        typeof validator,
        (x: { foo?: any; bar: { hello?: any; world?: unknown } }) => {
          foo: string;
          bar: { hello: string; world: boolean };
        }
      >('ok');

      assert.deepEqual(validator({ foo: 'foo', bar: { hello: 'hi' } }), {
        foo: 'foo',
        bar: { hello: 'hi', world: false },
      });

      assert.deepEqual(
        validator({ foo: 'foo', bar: { hello: 'hi' }, test: 2 } as any),
        {
          foo: 'foo',
          bar: { hello: 'hi', world: false },
        },
      );

      assert.throws(
        () => validator({ foo: 'foo', bar: 123 } as any),
        ValidationError,
      );
    });

    it('null', () => {
      const validator = compiler(null);
      typeCheck<typeof validator, (x: null) => null>('ok');

      assert.equal(validator(null), null);

      assert.throws(() => validator(12 as any), ValidationError);
    });

    it('array', () => {
      const validator = compiler([1, 'foo'] as [1, 'foo']);
      typeCheck<typeof validator, (x: [1, 'foo']) => [1, 'foo']>('ok');

      assert.deepEqual(validator([1, 'foo']), [1, 'foo']);

      assert.throws(() => validator(['foo', 1] as any), ValidationError);
      assert.throws(() => validator([1, 'foo', 1] as any), ValidationError);
      assert.throws(() => validator([1] as any), ValidationError);
      assert.throws(() => validator([2, 'foo'] as any), ValidationError);
      assert.throws(() => validator({ foo: 1 } as any), ValidationError);
    });

    it('async', async () => {
      const validator = compiler(
        (x: number): PromiseLike<number> =>
          x >= 0 ? Promise.resolve(x + 1) : Promise.reject(x),
      );
      typeCheck<typeof validator, (x: number) => PromiseLike<number>>('ok');
      typeCheck<typeof validator, (x: string) => PromiseLike<number>>(
        validator,
      );

      await assert.isFulfilled(validator(2));
      await assert.isRejected(validator(-1));

      assert.equal(await validator(1), 2);
    });

    it('deep async', async () => {
      const validator = compiler({
        foo: String,
        bar: {
          hello: (x: number): Promise<number> => Promise.resolve(x * 2),
          world: Number,
        },
      });
      typeCheck<
        typeof validator,
        (x: { foo?: any; bar: { hello: number; world?: any } }) => PromiseLike<{
          foo: string;
          bar: { hello: number; world: number };
        }>
      >('ok');

      await assert.isFulfilled(validator({ bar: { hello: 1 } }));
      await assert.isRejected(validator({} as any));

      assert.deepEqual(await validator({ bar: { hello: 1 } }), {
        foo: 'undefined',
        bar: {
          hello: 2,
          world: NaN,
        },
      });
    });
  });

  describe('compiler errors', () => {
    it('error path', () => {
      const validator = compiler({
        foo: (input: string) => {
          if (typeof input !== 'string') {
            throw new RangeError('my range error');
          }

          return input.toUpperCase();
        },
      });

      assert.deepEqual(validator({ foo: 'foo' }), { foo: 'FOO' });

      try {
        validator({ foo: 1 as never });
        assert.fail('should throw');
      } catch (e: any) {
        assert.equal(e.message, 'foo: my range error');
        assert.isArray(e.errors);

        assert.instanceOf(e.errors[0].error, RangeError);
        assert.equal(e.errors[0].error.message, 'my range error');
        assert.deepEqual(e.errors[0].path, ['foo']);
      }
    });

    it('nested error path', () => {
      const validator = compiler({
        foo: {
          bar: (input: string) => {
            if (typeof input !== 'string') {
              throw new RangeError('my range error');
            }

            return input.toUpperCase();
          },
        },
      });

      assert.deepEqual(validator({ foo: { bar: 'bar' } }), {
        foo: { bar: 'BAR' },
      });

      try {
        validator({ foo: { bar: 1 } as never });
        assert.fail('should throw');
      } catch (e: any) {
        assert.equal(e.message, 'foo.bar: my range error');
        assert.isArray(e.errors);

        assert.instanceOf(e.errors[0].error, RangeError);
        assert.equal(e.errors[0].error.message, 'my range error');
        assert.deepEqual(e.errors[0].path, ['foo', 'bar']);
      }
    });

    it('error change path', () => {
      const validator = compiler({
        foo: {
          bar: (input: string) => {
            if (typeof input !== 'string') {
              throw { message: 'my path error', path: ['test'] };
            }

            return input.toUpperCase();
          },
        },
      });

      assert.deepEqual(validator({ foo: { bar: 'foo' } }), {
        foo: { bar: 'FOO' },
      });

      try {
        validator({ foo: { bar: 1 as never } });
        assert.fail('should throw');
      } catch (e: any) {
        assert.equal(e.message, 'test: my path error');
        assert.isArray(e.errors);

        assert.deepEqual(e.errors[0].path, ['test']);
        assert.deepEqual(e.errors[0].error, {
          message: 'my path error',
          path: ['test'],
        });
      }
    });
  });
});
