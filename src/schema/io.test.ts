import 'mocha';
import { typeCheck } from './utils';
import {
  SchemaInput,
  SchemaParameters,
  SchemaResolveType,
  SchemaValidatorFunction,
} from './io';

/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-types */

describe('schema/io', () => {
  describe('SchemaParameters', () => {
    it('primitives', () => {
      typeCheck<SchemaParameters<number>, [number]>('ok');
      typeCheck<SchemaParameters<string>, [string]>('ok');
      typeCheck<SchemaParameters<boolean>, [boolean]>('ok');
      typeCheck<SchemaParameters<undefined>, [undefined]>('ok');
      typeCheck<SchemaParameters<unknown>, [unknown]>('ok');
      typeCheck<SchemaParameters<null>, [null]>('ok');
      typeCheck<SchemaParameters<void>, [void]>('ok');
      typeCheck<SchemaParameters<any>, unknown[]>('ok');
    });

    it('primitives constructors', () => {
      typeCheck<SchemaParameters<StringConstructor>, [any?]>('ok');
      typeCheck<SchemaParameters<NumberConstructor>, [any?]>('ok');
      typeCheck<SchemaParameters<BooleanConstructor>, [unknown?]>('ok');
      typeCheck<SchemaParameters<ObjectConstructor>, [any]>('ok');
      typeCheck<
        SchemaParameters<SymbolConstructor>,
        [(string | number | undefined)?]
      >('ok');
    });

    it('primitives values', () => {
      typeCheck<SchemaParameters<'foo'>, ['foo']>('ok');
      typeCheck<SchemaParameters<'foo'>, ['bar']>(['foo']);
      typeCheck<SchemaParameters<123>, [123]>('ok');
      typeCheck<SchemaParameters<123>, [number]>([123]);
      typeCheck<SchemaParameters<true>, [true]>('ok');
      typeCheck<SchemaParameters<true>, [false]>([true]);
      typeCheck<SchemaParameters<true>, [boolean]>([true]);
    });

    it('plain arrays', () => {
      typeCheck<SchemaParameters<[]>, [[]]>('ok');
      typeCheck<SchemaParameters<[number]>, [[number]]>('ok');
      typeCheck<SchemaParameters<[number, string]>, [[number, string]]>('ok');
      typeCheck<SchemaParameters<[unknown]>, [[unknown]]>('ok');
      typeCheck<SchemaParameters<[unknown]>, [[unknown?]]>([[1]]);
      typeCheck<SchemaParameters<[unknown?]>, [[unknown?]]>('ok');
      typeCheck<SchemaParameters<[number?]>, [[number?]]>('ok');
      typeCheck<SchemaParameters<[number?]>, [[number]]>([[]]);
      typeCheck<SchemaParameters<string[]>, [string[]]>('ok');
      typeCheck<SchemaParameters<[1, 'foo']>, [[1, 'foo']]>('ok');
      typeCheck<SchemaParameters<['foo', 1]>, [[1, 'foo']]>([['foo', 1]]);
    });

    it('regexp', () => {
      typeCheck<SchemaParameters<RegExp>, [string]>('ok');
      typeCheck<SchemaParameters<RegExp>, ['']>(['string']);
    });

    it('or', () => {
      typeCheck<SchemaParameters<string | number>, [string | number]>('ok');
      typeCheck<SchemaParameters<string | number>, [string]>(['string']);
      typeCheck<SchemaParameters<string | number>, [number]>(['string']);
      typeCheck<SchemaParameters<string | number>, [1]>(['string']);
      typeCheck<SchemaParameters<string | number>, ['str']>(['string']);
    });

    it('functions', () => {
      typeCheck<SchemaParameters<() => void>, []>('ok');
      typeCheck<SchemaParameters<(x: unknown) => void>, [unknown]>('ok');
      typeCheck<SchemaParameters<(x: string) => void>, [string]>('ok');
      typeCheck<SchemaParameters<(x?: string) => void>, [string?]>('ok');
      typeCheck<SchemaParameters<(x: 'foo') => void>, ['foo']>('ok');
    });

    it('functions or', () => {
      typeCheck<SchemaParameters<(() => void) | (() => string)>, []>('ok');
      typeCheck<
        SchemaParameters<(() => void) | ((x: number) => string)>,
        [number] | []
      >('ok');
      typeCheck<
        SchemaParameters<((o: string) => void) | ((o: number) => void)>,
        [string] | [number]
      >('ok');
      typeCheck<
        SchemaParameters<
          ((o: { x: number }) => void) | ((o: { y: number }) => void)
        >,
        [{ x: number }] | [{ y: number }]
      >('ok');
    });

    it('functions and', () => {
      typeCheck<
        // SchemaParameters<
        Parameters<((o: { x: number }) => void) | ((o: { y: number }) => void)>,
        // >,
        [{ x: number }] | [{ y: number }]
      >('ok');
    });

    it('objects', () => {
      typeCheck<SchemaParameters<{}>, [{}]>('ok');
      typeCheck<SchemaParameters<{ foo: string }>, [{ foo: string }]>('ok');
      typeCheck<SchemaParameters<{ foo?: string }>, [{ foo?: string }]>('ok');
    });

    it('validators properties', () => {
      typeCheck<
        SchemaParameters<{ foo: (x: string) => void }>,
        [{ foo: string }]
      >('ok');

      typeCheck<
        SchemaParameters<{ foo: (x: unknown) => void }>,
        [{ foo: unknown }]
      >('ok');

      typeCheck<SchemaParameters<{ foo: (x: any) => void }>, [{ foo: any }]>(
        'ok',
      );
    });

    it('optional properties', () => {
      typeCheck<
        SchemaParameters<{ foo: (x: string | undefined) => void }>,
        [{ foo: string | undefined }]
      >('ok');

      typeCheck<
        SchemaParameters<{ foo: (x?: string) => void }>,
        [{ foo?: string }]
      >('ok');

      typeCheck<SchemaParameters<{ foo: () => void }>, [{}]>('ok');

      typeCheck<
        SchemaParameters<{
          foo: { bar: (x: string | undefined) => void };
          x: boolean;
        }>,
        [{ foo: { bar: string | undefined }; x: boolean }]
      >('ok');

      typeCheck<
        SchemaParameters<{ foo: { bar: (x?: string) => void }; x: boolean }>,
        [{ foo: { bar?: string }; x: boolean }]
      >('ok');
    });

    it('optional array items', () => {
      typeCheck<
        SchemaParameters<[(x: string | undefined) => void]>,
        [[string | undefined]]
      >('ok');

      // Not supported Yet

      // typeCheck<SchemaParameters<[(x?: string) => void]>, [[string?]]>('ok');
      // typeCheck<SchemaParameters<[[number]?]>, [[[number]?]]>('ok');
    });
  });

  describe('SchemaInput', () => {
    it('basic use case', () => {
      typeCheck<
        SchemaInput<{
          foo: (x: string) => string;
          bar: 'hello';
          optional: (i?: number) => number | undefined;
        }>,
        { foo: string; bar: 'hello'; optional?: number }
      >('ok');
    });

    it('optional validator', () => {
      typeCheck<
        SchemaInput<(i?: number) => number | undefined>,
        number | undefined
      >('ok');
    });
  });

  describe('SchemaReturnType', () => {
    it('primitives', () => {
      typeCheck<SchemaResolveType<null>, null>('ok');
      typeCheck<SchemaResolveType<void>, void>('ok');
      typeCheck<SchemaResolveType<number>, number>('ok');
      typeCheck<SchemaResolveType<string>, string, true>(true);
      typeCheck<SchemaResolveType<boolean>, boolean>('ok');
      typeCheck<[SchemaResolveType<unknown>], [unknown]>('ok');
      typeCheck<SchemaResolveType<undefined>, undefined>('ok');
      typeCheck<[SchemaResolveType<any>], [any]>('ok');
    });

    it('primitives constructors', () => {
      typeCheck<SchemaResolveType<StringConstructor>, string, true>(true);
      typeCheck<SchemaResolveType<NumberConstructor>, number>('ok');
      typeCheck<SchemaResolveType<BooleanConstructor>, boolean>('ok');
      typeCheck<SchemaResolveType<ObjectConstructor>, object>('ok');
      typeCheck<SchemaResolveType<SymbolConstructor>, symbol>('ok');
    });

    it('primitives values', () => {
      typeCheck<SchemaResolveType<'foo'>, 'foo'>('ok');
      typeCheck<SchemaResolveType<'foo'>, 'bar'>('foo');
      typeCheck<SchemaResolveType<123>, 123>('ok');
      typeCheck<SchemaResolveType<123>, number>(123);
      typeCheck<SchemaResolveType<true>, true>('ok');
      typeCheck<SchemaResolveType<true>, false>(true);
      typeCheck<SchemaResolveType<true>, boolean>(true);
    });

    it('plain arrays', () => {
      typeCheck<SchemaResolveType<[]>, []>('ok');
      typeCheck<SchemaResolveType<[number]>, [number]>('ok');
      typeCheck<SchemaResolveType<[number, string]>, [number, string]>('ok');
      typeCheck<SchemaResolveType<[unknown]>, [unknown]>('ok');
      typeCheck<SchemaResolveType<[unknown]>, [unknown?]>([[1]]);
      typeCheck<SchemaResolveType<[unknown?]>, [unknown?]>('ok');
      typeCheck<SchemaResolveType<[number?]>, [number?]>('ok');
      typeCheck<SchemaResolveType<[number?]>, [number]>([]);
      typeCheck<SchemaResolveType<string[]>, string[]>('ok');
      typeCheck<SchemaResolveType<[1, 'foo']>, [1, 'foo']>('ok');
      typeCheck<SchemaResolveType<['foo', 1]>, [1, 'foo']>(['foo', 1]);
    });

    it('regexp', () => {
      typeCheck<SchemaResolveType<RegExp>, string, true>(true);
      typeCheck<SchemaResolveType<RegExp>, ''>('string');
    });

    it('or', () => {
      typeCheck<SchemaResolveType<string | number>, string | number, true>(
        true,
      );
      typeCheck<SchemaResolveType<string | number>, string>('string');
      typeCheck<SchemaResolveType<string | number>, number>('string');
      typeCheck<SchemaResolveType<string | number>, 1>('string');
      typeCheck<SchemaResolveType<string | number>, 'str'>('string');
    });

    it('validators', () => {
      typeCheck<SchemaResolveType<() => void>, void>('ok');
      typeCheck<[SchemaResolveType<() => unknown>], [unknown]>('ok');
      typeCheck<[SchemaResolveType<() => string>], [string]>('ok');
      typeCheck<[SchemaResolveType<() => 'foo'>], ['foo']>('ok');
      typeCheck<SchemaResolveType<() => number>, number>('ok');
      typeCheck<SchemaResolveType<() => boolean>, boolean>('ok');
      typeCheck<SchemaResolveType<() => false>, false>('ok');
      typeCheck<SchemaResolveType<() => 1>, 1>('ok');
    });

    it('promises', () => {
      typeCheck<SchemaResolveType<() => Promise<string>>, string, true>(true);
      typeCheck<
        SchemaResolveType<() => string | Promise<string>>,
        string,
        true
      >(true);
      typeCheck<
        SchemaResolveType<() => number | Promise<string>>,
        number | string,
        true
      >(true);
    });

    it('objects', () => {
      typeCheck<SchemaResolveType<{}>, {}, true>(true);
      typeCheck<SchemaResolveType<{ foo: string }>, { foo: string }>('ok');
      typeCheck<SchemaResolveType<{ foo?: string }>, { foo?: string }>('ok');
    });

    it('validators properties', () => {
      typeCheck<SchemaResolveType<{ foo: () => string }>, { foo: string }>(
        'ok',
      );
      typeCheck<SchemaResolveType<{ foo: () => 1 }>, { foo: 1 }>('ok');
      typeCheck<
        SchemaResolveType<{ foo: () => 1 | 'foo' }>,
        { foo: 1 | 'foo' }
      >('ok');
      typeCheck<SchemaResolveType<{ foo: () => void }>, { foo?: void }>('ok');

      typeCheck<
        SchemaResolveType<{ foo: () => Promise<number> }>,
        { foo: number }
      >('ok');
    });

    it('optional properties', () => {
      typeCheck<
        SchemaResolveType<{ foo: (x: string) => void }>,
        { foo?: void }
      >('ok');

      typeCheck<
        SchemaResolveType<{ foo: (x?: string) => void }>,
        { foo?: void }
      >('ok');
    });

    it('undefined properties', () => {
      typeCheck<
        SchemaResolveType<{ foo: (x: string) => undefined }>,
        { foo?: undefined }
      >('ok');

      typeCheck<
        SchemaResolveType<{ foo: (x: string) => undefined | number }>,
        { foo?: number }
      >('ok');

      typeCheck<
        SchemaResolveType<{ foo: (x?: string) => number }>,
        { foo: number }
      >('ok');
    });

    it('optional array items', () => {
      typeCheck<SchemaResolveType<[(x: string | undefined) => void]>, [void]>(
        'ok',
      );

      typeCheck<SchemaResolveType<[(x?: string | undefined) => void]>, [void]>(
        'ok',
      );
    });
  });

  describe('SchemaValidatorFunction', () => {
    it('sync', () => {
      typeCheck<SchemaValidatorFunction<() => string>, () => string>('ok');

      typeCheck<
        SchemaValidatorFunction<() => string | number>,
        () => string | number
      >('ok');

      typeCheck<
        SchemaValidatorFunction<{ foo: () => string | number }>,
        (x: { foo?: undefined }) => { foo: string | number }
      >('ok');
    });

    it('async', () => {
      typeCheck<
        SchemaValidatorFunction<() => PromiseLike<string>>,
        () => PromiseLike<string>
      >('ok');

      typeCheck<
        SchemaValidatorFunction<() => PromiseLike<string | number>>,
        () => PromiseLike<string | number>
      >('ok');

      typeCheck<
        SchemaValidatorFunction<() => Promise<string | number>>,
        () => PromiseLike<string | number>
      >('ok');

      typeCheck<
        SchemaValidatorFunction<() => PromiseLike<true>>,
        () => PromiseLike<true>
      >('ok');

      typeCheck<
        SchemaValidatorFunction<() => Promise<string>>,
        () => PromiseLike<string>
      >('ok');

      typeCheck<
        SchemaValidatorFunction<{ foo(): Promise<string | number> }>,
        (x: { foo?: undefined }) => PromiseLike<{ foo: string | number }>
      >('ok');

      typeCheck<
        SchemaValidatorFunction<{
          foo: () => Promise<string | number>;
          bar: string;
        }>,
        (x: {
          foo?: undefined;
          bar: string;
        }) => PromiseLike<{ foo: string | number; bar: string }>
      >('ok');
    });

    it('maybe async', () => {
      typeCheck<
        SchemaValidatorFunction<() => string | PromiseLike<number>>,
        () => string | number | PromiseLike<number | string>
      >('ok');

      typeCheck<
        SchemaValidatorFunction<() => unknown>,
        () => unknown | PromiseLike<unknown>
      >('ok');

      typeCheck<
        SchemaValidatorFunction<{
          foo: () => Promise<string> | number;
          bar: string;
        }>,
        (x: {
          foo?: undefined;
          bar: string;
        }) =>
          | PromiseLike<{ foo: string | number; bar: string }>
          | { foo: string | number; bar: string }
      >('ok');

      typeCheck<
        SchemaValidatorFunction<{ foo: () => unknown }>,
        (x: {
          foo?: undefined;
        }) => { foo?: unknown } | PromiseLike<{ foo?: unknown }>
      >('ok');
    });
  });
});
