import 'mocha';
import { assert } from 'chai';
import { typeCheck, deepConcat, RecursiveMerge } from './utils';
import { ValidationError } from './errors';

/* eslint-disable
 @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-function,
 @typescript-eslint/no-unused-vars,@typescript-eslint/ban-types */

describe('schema/utils', () => {
  describe('typeCheck', () => {
    it('string', () => {
      typeCheck<string, string, true>(true);
      typeCheck<string, 1>('string');
      typeCheck<string, 'foo'>('string');
    });

    it('number', () => {
      typeCheck<number, number>('ok');
      typeCheck<number, 1>(1 as number);
      typeCheck<number, boolean>(1);
      typeCheck<number, string>(1);
      typeCheck<number, object>(1);
      typeCheck<number, never>(1);
      typeCheck<number, any>(1);
      typeCheck<number, {}>(1);
      typeCheck<[number], [boolean]>([1]);
    });

    it('1', () => {
      typeCheck<1, 1>('ok');
      typeCheck<1, number>(1);
      typeCheck<1, never>(1);
      typeCheck<1, any>(1);
      typeCheck<1, {}>(1);
    });

    it('boolean', () => {
      typeCheck<boolean, boolean>('ok');
      typeCheck<boolean, true>(true);
      typeCheck<boolean, false>(true);
      typeCheck<boolean, {}>(true);
      typeCheck<boolean, object>(true);
      typeCheck<boolean, string>(true);
      typeCheck<boolean, any>(true);
      typeCheck<boolean, void>(true);
      typeCheck<boolean, 1>(true);
    });

    it('true', () => {
      typeCheck<true, true>('ok');
      typeCheck<true, false>(true);
      typeCheck<true, boolean>(true);
      typeCheck<true, number>(true);
      typeCheck<true, any>(true);
      typeCheck<true, {}>(true);
    });

    it('[number]', () => {
      typeCheck<[number], [number]>('ok');
      typeCheck<[number], [1]>([1]);
      typeCheck<[number], number[]>([1]);
      typeCheck<[number], [boolean]>([1]);
      typeCheck<[number], object>([1]);
      typeCheck<[number], []>([1]);
      typeCheck<[number], [any]>([1]);
      typeCheck<[number], any[]>([1]);
    });

    it('number[]]', () => {
      typeCheck<number[], number[]>('ok');
      typeCheck<number[], [1]>([1]);
      typeCheck<number[], [number]>([1]);
      typeCheck<number[], any[]>([1]);
      typeCheck<number[], unknown[]>([1]);
      typeCheck<number[], never[]>([1]);
    });

    it('[1]', () => {
      typeCheck<[1], [1]>('ok');
      typeCheck<[1], [2]>([1]);
      typeCheck<[1], [number]>([1]);
      typeCheck<[1], [boolean]>([1]);
      typeCheck<[1], object>([1]);
      typeCheck<[1], []>([1]);
    });

    it('unknown', () => {
      typeCheck<unknown, unknown, true>(true);
      typeCheck<unknown, never>('any');
      typeCheck<unknown, any>('any');
      typeCheck<unknown, boolean>('any');
      typeCheck<unknown, string>('any');
      typeCheck<unknown, {}>('any');
      typeCheck<unknown, true>('any');
      typeCheck<unknown, 1>('any');
    });

    it('any', () => {
      typeCheck<any, any, true>(true);
      typeCheck<any, never>('any');
      typeCheck<any, boolean>('any');
      typeCheck<any, string>('any');
      typeCheck<any, unknown>('any');
      typeCheck<any, object>('any');
      typeCheck<any, {}>('any');
      typeCheck<any, true>('any');
      typeCheck<any, 1>('any');
    });

    it('[any]', () => {
      typeCheck<[any], [any]>('ok');
      typeCheck<[any], [never]>(['any']);
      typeCheck<[any], any>(['any']);
      typeCheck<[any], any[]>(['any']);
      typeCheck<[any], [unknown]>(['any']);
      typeCheck<[any], [number]>(['any']);
      typeCheck<[any], [string]>(['any']);
    });

    it('never', () => {
      typeCheck<never, never, true>(true);
    });

    it('PromiseLike', () => {
      typeCheck<PromiseLike<string>, PromiseLike<string>>('ok');
      typeCheck<PromiseLike<string>, PromiseLike<number>>(
        Promise.resolve('string'),
      );
      typeCheck<PromiseLike<string>, Promise<string>>(
        Promise.resolve('string'),
      );
    });

    it('Promise', () => {
      typeCheck<Promise<string>, Promise<string>>('ok');
      typeCheck<Promise<string>, Promise<number>>(Promise.resolve('string'));
      typeCheck<PromiseLike<string>, Promise<string>>(
        Promise.resolve('string'),
      );
    });

    it('return type', () => {
      typeCheck<
        ReturnType<() => string | PromiseLike<number>>,
        string | PromiseLike<number>,
        true
      >(true);

      typeCheck<
        ReturnType<() => string | PromiseLike<number>>,
        string | PromiseLike<boolean>,
        true
      >('string');
    });

    describe('functions', () => {
      it('return value', () => {
        typeCheck<() => void, () => void>('ok');
        typeCheck<() => boolean, () => boolean>('ok');
        typeCheck<() => number, () => number>('ok');

        typeCheck<() => true, () => number>(() => true);
        typeCheck<() => true, () => boolean>(() => true);
        typeCheck<() => true, () => void>(() => true);
        typeCheck<() => boolean, () => void>(() => true);
        typeCheck<() => boolean, () => true>(() => true);
        typeCheck<() => number, () => void>(() => 1);
        typeCheck<() => [1, 'foo'], () => [1, 'foo']>('ok');
        typeCheck<() => [1, 'foo'], () => void>(() => [1, 'foo']);
        typeCheck<() => [1, 'foo'], () => ['foo', 1]>(() => [1, 'foo']);

        typeCheck<() => PromiseLike<number>, () => PromiseLike<number>>('ok');
        typeCheck<() => PromiseLike<number>, () => PromiseLike<string>>(() =>
          Promise.resolve(1),
        );
      });

      it('parameters', () => {
        typeCheck<() => void, () => void>('ok');
        typeCheck<(x: number) => void, (x: number) => void>('ok');
        typeCheck<(x: boolean) => void, (x: boolean) => void>('ok');
        typeCheck<(x: 1) => void, (x: 1) => void>('ok');
        typeCheck<() => void, (x: 1) => void>(() => {});
        typeCheck<(x: 1) => void, (x: 2) => void>((x: 1) => {});
        typeCheck<(x: false) => void, (x: true) => void>((x: false) => {});
        typeCheck<(x: [1, 'foo']) => void, (x: [1, 'foo']) => void>('ok');
        typeCheck<(x: [1, 'foo']) => void, () => void>((x: [1, 'foo']) => {});
        typeCheck<(x: [1, 'foo']) => void, (x: ['foo', 1]) => void>(
          (x: [1, 'foo']) => {},
        );
        typeCheck<(x: [1, 'foo']) => [1, 'foo'], (x: [1, 'foo']) => [1, 'foo']>(
          'ok',
        );
        typeCheck<(x: [1, 'foo']) => [1, 'foo'], (x: [1, 'foo']) => ['foo', 1]>(
          (x: [1, 'foo']) => x,
        );
      });
    });
  });

  describe('deepConcat', () => {
    it('1 element', () => {
      const obj = { foo: 1 };

      assert.equal(deepConcat('foo'), 'foo');
      assert.equal(deepConcat(null), null);
      assert.equal(deepConcat(undefined), undefined);
      assert.equal(deepConcat(1), 1);
      assert.equal(deepConcat(obj), obj);
    });

    it('plain elements', () => {
      assert.equal(deepConcat('foo', 'foo'), 'foo');
      assert.equal(deepConcat(null, null), null);
      assert.equal(deepConcat(undefined, undefined), undefined);
      assert.equal(deepConcat(undefined, undefined, 1), 1);
      assert.equal(deepConcat(undefined, 1, undefined), 1);
      assert.equal(deepConcat(1, 1), 1);
      assert.equal(deepConcat(true, true), true);
      assert.equal(deepConcat(null, undefined), null);
      assert.equal(deepConcat(undefined, 'foo'), 'foo');

      assert.throw(() => deepConcat(true, false), ValidationError);
      assert.throw(() => deepConcat('foo', false), ValidationError);
      assert.throw(() => deepConcat('foo', 'bar'), ValidationError);
      assert.throw(() => deepConcat('foo', undefined, 'bar'), ValidationError);
      assert.throw(() => deepConcat(1, 1.1), ValidationError);
      assert.throw(() => deepConcat(1, {}), ValidationError);
      assert.throw(() => deepConcat(1, { foo: 1 }), ValidationError);
    });

    it('deep elements', () => {
      assert.deepEqual(deepConcat({ foo: 1 }, { bar: 2 }), { foo: 1, bar: 2 });
      assert.deepEqual(
        deepConcat(
          { foo: 1, x: { hello: 'world' } },
          { foo: 1, x: { me: 'hi' } },
          { bar: 3 },
        ),
        { foo: 1, bar: 3, x: { hello: 'world', me: 'hi' } },
      );
      assert.deepEqual(deepConcat({ foo: 1 }, undefined, { bar: 2 }), {
        foo: 1,
        bar: 2,
      });
      assert.deepEqual(deepConcat(['foo'], ['foo', 1]), ['foo', 1]);
      assert.deepEqual(deepConcat(['foo'], [undefined, 1]), ['foo', 1]);
      assert.deepEqual(deepConcat(['foo', { bar: 1 }], ['foo', { hello: 2 }]), [
        'foo',
        { bar: 1, hello: 2 } as any,
      ]);

      assert.throw(
        () => deepConcat({ foo: 1 }, { foo: 2, bar: 2 }),
        ValidationError,
      );
      assert.throw(() => deepConcat({ foo: 1 }, null), ValidationError);
      assert.throw(() => deepConcat({ foo: 1 }, true), ValidationError);
    });
  });

  describe('RecursiveMerge', () => {
    it('or primitives', () => {
      typeCheck<RecursiveMerge<[string] | [string]>, [string]>('ok');
      typeCheck<RecursiveMerge<[number] | [number]>, [number]>('ok');
      typeCheck<RecursiveMerge<[number] | [string]>, [number | string]>('ok');
      // typeCheck<
      //   [RecursiveMerge<[string] | [string, string]>],
      //   [[string] | [string | string]]
      // >('ok');
    });

    it('or primitives maybes', () => {
      typeCheck<RecursiveMerge<[string] | [string?]>, [string?]>('ok');
      typeCheck<RecursiveMerge<[number?] | [string]>, [(number | string)?]>(
        'ok',
      );
    });

    it('and primitives', () => {
      typeCheck<RecursiveMerge<[string] & [string]>, [string]>('ok');
      typeCheck<RecursiveMerge<[number] & [string]>, [never]>('ok');
    });

    it('and primitives maybes', () => {
      typeCheck<RecursiveMerge<[string?] & [string]>, [string]>('ok');
      typeCheck<RecursiveMerge<[number?] & [string]>, [never]>('ok');
    });

    it('and objects', () => {
      typeCheck<
        RecursiveMerge<{ foo: string } & { foo: string }>,
        { foo: string }
      >('ok');
      typeCheck<
        RecursiveMerge<{ foo: string } & { foo: number }>,
        { foo: never }
      >('ok');
      typeCheck<
        RecursiveMerge<{ foo: string } & { bar: number }>,
        { foo: string; bar: number }
      >('ok');
      typeCheck<
        RecursiveMerge<[{ foo: string }] & [{ foo: string }]>,
        [{ foo: string }]
      >('ok');
      typeCheck<
        RecursiveMerge<[{ foo: string }] & [{ bar: number }]>,
        [{ foo: string; bar: number }]
      >('ok');
      typeCheck<
        RecursiveMerge<[{ foo: string }] & [{ bar?: number }]>,
        [{ foo: string; bar?: number }]
      >('ok');
    });

    it('or objects', () => {
      typeCheck<
        RecursiveMerge<{ foo: string } | { foo: string }>,
        { foo: string }
      >('ok');
      typeCheck<
        RecursiveMerge<{ foo: string } | { foo: number }>,
        { foo: string } | { foo: number }
      >('ok');
      typeCheck<
        RecursiveMerge<[{ foo: string }] | [{ foo: string }]>,
        [{ foo: string }]
      >('ok');
      typeCheck<
        RecursiveMerge<[{ foo: string }] | [{ foo: number }]>,
        [{ foo: string } | { foo: number }]
      >('ok');
    });
  });
});
