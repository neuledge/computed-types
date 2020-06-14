import FunctionType, { FunctionParameters } from './FunctionType.ts';
import { IsAsync, Primitive, ResolvedValue } from './utils.ts';

type SchemaOptionalKeys<S> = Exclude<
  {
    [K in keyof S]: [S[K]] extends [FunctionType]
      ? [] extends Parameters<S[K]>
        ? K
        : never
      : [undefined] extends [S[K]]
      ? K
      : never;
  }[keyof S],
  undefined
>;

type SchemaRequiredKeys<S> = Exclude<keyof S, SchemaOptionalKeys<S>>;

type SchemaKeysObject<S> = {
  [K in keyof S & SchemaRequiredKeys<S>]: K;
} &
  {
    [K in keyof S & SchemaOptionalKeys<S>]?: K;
  };

export type SchemaParameters<S> = [S] extends [FunctionType]
  ? Parameters<S>
  : [S] extends [Primitive]
  ? [S]
  : [S] extends [RegExp]
  ? [string]
  : [S] extends [Array<any>] // eslint-disable-line @typescript-eslint/no-explicit-any
  ? [
      {
        [K in keyof S]: SchemaParameters<S[K]>[0];
      },
    ]
  : [S] extends [object] // eslint-disable-line @typescript-eslint/ban-types
  ? [{ [K in keyof SchemaKeysObject<S>]: SchemaParameters<S[K]>[0] }]
  : [unknown] extends [S]
  ? [unknown]
  : never;

export type SchemaResolveType<S> = S extends FunctionType
  ? ResolvedValue<ReturnType<S>>
  : S extends Primitive
  ? S
  : S extends RegExp
  ? string
  : S extends object // eslint-disable-line @typescript-eslint/ban-types
  ? { [K in keyof S]: SchemaResolveType<S[K]> }
  : unknown extends S
  ? unknown
  : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RemoveAsync<T> = T extends PromiseLike<any> ? never : T;

type IsSchemaAsync<S> = S extends FunctionType
  ? IsAsync<ReturnType<S>>
  : S extends object // eslint-disable-line @typescript-eslint/ban-types
  ? S extends RegExp
    ? false
    : { [K in keyof S]: IsSchemaAsync<S[K]> }[keyof S]
  : IsAsync<S>;

export type SchemaReturnType<
  S,
  R = SchemaResolveType<S>
> = unknown extends IsSchemaAsync<S>
  ? PromiseLike<R> | R
  : true extends IsSchemaAsync<S>
  ? PromiseLike<R>
  : R;

export type SchemaValidatorFunction<S> = FunctionType<
  SchemaReturnType<S>,
  SchemaParameters<S>
>;

export type MergeSchemaParameters<P extends FunctionParameters> = [P] extends [
  never,
]
  ? [never]
  : [P] extends [[]]
  ? []
  : [P] extends [[unknown]]
  ? [P[0]]
  : [P] extends [[unknown?]]
  ? [P[0]?]
  : P;
