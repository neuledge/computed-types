import 'mocha';
import { assert, use } from 'chai';
import { ObjectProperty, typeCheck } from './schema/utils';
import chaiAsPromised from 'chai-as-promised';
import Schema from './Schema';
import { ValidationError } from './schema/errors';
import string from './string';
import array from './array';
import { SchemaParameters } from './schema/io';
import number from './number';
import unknown from './unknown';

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

    it('should handle async errors nicely', async () => {
      // https://github.com/neuledge/computed-types/issues/76

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async function AvailableUsername(input: string) {
        throw new TypeError('my error');
      }

      const UserSchema = {
        username: AvailableUsername,
      };
      const validator = Schema(UserSchema);

      try {
        await validator({ username: 'test' });

        throw new Error('bad');
      } catch (error: any) {
        assert.equal(error.message, 'username: my error');
      }
    });

    it('should handle nested objects', () => {
      const validator = Schema({
        foo: Schema({
          bar: string.min(1),
        }),
      });

      typeCheck<
        typeof validator,
        (x: { foo: { bar: string } }) => { foo: { bar: string } }
      >('ok');
      assert.deepEqual(validator({ foo: { bar: 'abc' } }), {
        foo: { bar: 'abc' },
      });

      try {
        validator({ foo: { bar: '' } } as never);
        assert.fail('should throw');
      } catch (e: any) {
        assert.instanceOf(e, ValidationError);

        assert.equal(
          e.message,
          'foo.bar: Expect length to be minimum of 1 characters (actual: 0)',
        );
        assert.isArray(e.errors);

        assert.instanceOf(e.errors[0].error, RangeError);
        assert.equal(
          e.errors[0].error.message,
          'Expect length to be minimum of 1 characters (actual: 0)',
        );
        assert.deepEqual(e.errors[0].path, ['foo', 'bar']);
      }
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

    it('issue #69', () => {
      const A = Schema.either(
        { id: 1 as const },
        { id: 2 as const, data: string.optional() },
      );
      type AInputs = SchemaParameters<typeof A>;

      typeCheck<AInputs, [{ id: 1 } | { id: 2; data?: string | null }]>('ok');
    });

    it('issue #169 symmetric candidates reject with a generic either error', () => {
      const X = {
        foo: string.equals('X'),
        bar: array.max(0),
        baz: array.min(1),
      };
      const Y = {
        foo: string.equals('Y'),
        bar: array.min(1),
        baz: array.max(0),
      };

      const validator = Schema.either(X, Y);
      const reversed = Schema.either(Y, X);

      assert.deepEqual(validator({ foo: 'X', bar: [], baz: [1] }), {
        foo: 'X',
        bar: [],
        baz: [1],
      });
      assert.deepEqual(validator({ foo: 'Y', bar: [1], baz: [] }), {
        foo: 'Y',
        bar: [1],
        baz: [],
      });

      const assertGenericEitherError = (eitherValidator: any): void => {
        for (const input of [
          { foo: 'X', bar: [], baz: [] },
          { foo: 'Y', bar: [], baz: [] },
        ]) {
          try {
            eitherValidator(input);
            assert.fail('should throw');
          } catch (e: any) {
            assert.instanceOf(e, ValidationError);
            assert.equal(e.message, 'No alternatives matched');
            assert.notInclude(e.message, 'foo');
            assert.notInclude(e.message, 'bar');
            assert.notInclude(e.message, 'baz');
            assert.isUndefined(e.path);
            assert.isUndefined(e.errors);
          }
        }
      };

      assertGenericEitherError(validator);
      assertGenericEitherError(reversed);
    });

    it('issue #169 async candidates reject with a generic either error', async () => {
      const validator = Schema.either(
        async (x: string): Promise<string> => {
          if (x !== 'X') {
            throw new RangeError(`Expect value to equal "X"`);
          }

          return x;
        },
        async (x: string): Promise<string> => {
          if (x !== 'Y') {
            throw new RangeError(`Expect value to equal "Y"`);
          }

          return x;
        },
      );

      await assert.becomes(validator('X'), 'X');
      await assert.becomes(validator('Y'), 'Y');
      await assert.isRejected(
        validator('Z') as any,
        ValidationError,
        'No alternatives matched',
      );
    });

    it('single candidate preserves the original error', async () => {
      const validator = Schema.either({
        foo: string.equals('X'),
      });

      assert.throw(
        () => validator({ foo: 'Y' } as any),
        ValidationError,
        'foo: Expect value to equal "X"',
      );

      const asyncValidator = Schema.either(
        async (x: string): Promise<string> => {
          if (x !== 'X') {
            throw new RangeError(`Expect value to equal "X"`);
          }

          return x;
        },
      );

      await assert.isRejected(
        asyncValidator('Y') as any,
        RangeError,
        'Expect value to equal "X"',
      );
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

  describe('.record', () => {
    it('Record<string, number>', () => {
      const validator = Schema.record(string, number);

      typeCheck<
        typeof validator,
        (x: Record<string, number>) => Record<string, number>
      >('ok');

      assert.deepEqual(validator({ foo: 1, bar: 2 }), { foo: 1, bar: 2 });
      assert.deepEqual(validator({}), {});

      assert.throw(
        () => validator({ foo: 'foo' } as any),
        ValidationError,
        'foo: Expect value to be "number"',
      );
    });

    it('Record<unknown.string, unknown.number>', () => {
      const validator = Schema.record(unknown.string(), unknown.number());

      typeCheck<
        typeof validator,
        (x: Record<ObjectProperty, unknown>) => Record<string, number>
      >('ok');

      assert.deepEqual(validator({ foo: 1, bar: 2 }), { foo: 1, bar: 2 });
      assert.deepEqual(validator({}), {});
      assert.deepEqual(validator({ foo: 1, bar: '2' }), { foo: 1, bar: 2 });

      assert.throw(
        () => validator({ foo: 1, bar: 'bar' } as any),
        ValidationError,
        'bar: Unknown number value',
      );
    });

    it('Record<unknown.number, unknown.string>', () => {
      const validator = Schema.record(unknown.number(), unknown.string());

      typeCheck<
        typeof validator,
        (x: Record<ObjectProperty, unknown>) => Record<number, string>
      >('ok');

      assert.deepEqual(validator({ 1: 'foo', 2: 'bar' }), {
        1: 'foo',
        2: 'bar',
      });
      assert.deepEqual(validator({}), {});
      assert.deepEqual(validator({ '1': 1, '02.0': 'bar' }), {
        1: '1',
        2: 'bar',
      });

      assert.throw(
        () => validator({ foo: 'foo' } as any),
        ValidationError,
        'foo: Unknown number value',
      );
    });
  });
});
