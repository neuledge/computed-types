import 'mocha';
import { typeCheck } from './utils';
import { SchemaParameters, SchemaReturnType } from './io';
// import { either } from './logic';

/* eslint-disable @typescript-eslint/no-explicit-any */

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

    it('validators', () => {
      typeCheck<SchemaParameters<() => void>, []>('ok');
      typeCheck<SchemaParameters<(x: unknown) => void>, [unknown]>('ok');
      typeCheck<SchemaParameters<(x: string) => void>, [string]>('ok');
      typeCheck<SchemaParameters<(x?: string) => void>, [string?]>('ok');
      typeCheck<SchemaParameters<(x: 'foo') => void>, ['foo']>('ok');
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

  describe('SchemaReturnType', () => {
    it('primitives', () => {
      typeCheck<SchemaReturnType<null>, null>('ok');
      typeCheck<SchemaReturnType<void>, void>('ok');
      typeCheck<SchemaReturnType<number>, number>('ok');
      typeCheck<SchemaReturnType<string>, string, true>(true);
      typeCheck<SchemaReturnType<boolean>, boolean>('ok');
      typeCheck<[SchemaReturnType<unknown>], [unknown]>('ok');
      typeCheck<SchemaReturnType<undefined>, undefined>('ok');
      typeCheck<[SchemaReturnType<any>], [any]>('ok');
    });

    it('primitives constructors', () => {
      typeCheck<SchemaReturnType<StringConstructor>, string, true>(true);
      typeCheck<SchemaReturnType<NumberConstructor>, number>('ok');
      typeCheck<SchemaReturnType<BooleanConstructor>, boolean>('ok');
      typeCheck<SchemaReturnType<ObjectConstructor>, object>('ok');
      typeCheck<SchemaReturnType<SymbolConstructor>, symbol>('ok');
    });

    it('primitives values', () => {
      typeCheck<SchemaReturnType<'foo'>, 'foo'>('ok');
      typeCheck<SchemaReturnType<'foo'>, 'bar'>('foo');
      typeCheck<SchemaReturnType<123>, 123>('ok');
      typeCheck<SchemaReturnType<123>, number>(123);
      typeCheck<SchemaReturnType<true>, true>('ok');
      typeCheck<SchemaReturnType<true>, false>(true);
      typeCheck<SchemaReturnType<true>, boolean>(true);
    });

    it('plain arrays', () => {
      typeCheck<SchemaReturnType<[]>, []>('ok');
      typeCheck<SchemaReturnType<[number]>, [number]>('ok');
      typeCheck<SchemaReturnType<[number, string]>, [number, string]>('ok');
      typeCheck<SchemaReturnType<[unknown]>, [unknown]>('ok');
      typeCheck<SchemaReturnType<[unknown]>, [unknown?]>([[1]]);
      typeCheck<SchemaReturnType<[unknown?]>, [unknown?]>('ok');
      typeCheck<SchemaReturnType<[number?]>, [number?]>('ok');
      typeCheck<SchemaReturnType<[number?]>, [number]>([]);
      typeCheck<SchemaReturnType<string[]>, string[]>('ok');
      typeCheck<SchemaReturnType<[1, 'foo']>, [1, 'foo']>('ok');
      typeCheck<SchemaReturnType<['foo', 1]>, [1, 'foo']>(['foo', 1]);
    });

    it('regexp', () => {
      typeCheck<SchemaReturnType<RegExp>, string, true>(true);
      typeCheck<SchemaReturnType<RegExp>, ''>('string');
    });

    it('or', () => {
      typeCheck<SchemaReturnType<string | number>, string | number, true>(true);
      typeCheck<SchemaReturnType<string | number>, string>('string');
      typeCheck<SchemaReturnType<string | number>, number>('string');
      typeCheck<SchemaReturnType<string | number>, 1>('string');
      typeCheck<SchemaReturnType<string | number>, 'str'>('string');
    });

    it('validators', () => {
      typeCheck<SchemaReturnType<() => void>, void>('ok');
      typeCheck<[SchemaReturnType<() => unknown>], [unknown]>('ok');
      typeCheck<[SchemaReturnType<() => string>], [string]>('ok');
      typeCheck<[SchemaReturnType<() => 'foo'>], ['foo']>('ok');
      typeCheck<SchemaReturnType<() => number>, number>('ok');
      typeCheck<SchemaReturnType<() => boolean>, boolean>('ok');
      typeCheck<SchemaReturnType<() => false>, false>('ok');
      typeCheck<SchemaReturnType<() => 1>, 1>('ok');
    });

    it('promises', () => {
      typeCheck<SchemaReturnType<() => Promise<string>>, string, true>(true);
      typeCheck<SchemaReturnType<() => string | Promise<string>>, string, true>(
        true,
      );
      typeCheck<
        SchemaReturnType<() => number | Promise<string>>,
        number | string,
        true
      >(true);
    });

    it('objects', () => {
      typeCheck<SchemaReturnType<{}>, {}, true>(true);
      typeCheck<SchemaReturnType<{ foo: string }>, { foo: string }>('ok');
      typeCheck<SchemaReturnType<{ foo?: string }>, { foo?: string }>('ok');
    });

    it('validators properties', () => {
      typeCheck<SchemaReturnType<{ foo: () => string }>, { foo: string }>('ok');
      typeCheck<SchemaReturnType<{ foo: () => 1 }>, { foo: 1 }>('ok');
      typeCheck<SchemaReturnType<{ foo: () => 1 | 'foo' }>, { foo: 1 | 'foo' }>(
        'ok',
      );
      typeCheck<SchemaReturnType<{ foo: () => void }>, { foo: void }>('ok');

      typeCheck<
        SchemaReturnType<{ foo: () => Promise<number> }>,
        { foo: number }
      >('ok');
    });

    it('optional properties', () => {
      typeCheck<SchemaReturnType<{ foo: (x: string) => void }>, { foo: void }>(
        'ok',
      );

      typeCheck<SchemaReturnType<{ foo: (x?: string) => void }>, { foo: void }>(
        'ok',
      );
    });

    it('optional array items', () => {
      typeCheck<SchemaReturnType<[(x: string | undefined) => void]>, [void]>(
        'ok',
      );

      typeCheck<SchemaReturnType<[(x?: string | undefined) => void]>, [void]>(
        'ok',
      );
    });
  });
});
