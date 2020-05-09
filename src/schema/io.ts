import FunctionType from './FunctionType';
import { Primitive, ResolvedValue } from './utils';

type SchemaOptionalKeys<S> = Exclude<
  {
    [K in keyof S]: [S[K]] extends [FunctionType]
      ? Parameters<S[K]> extends Required<Parameters<S[K]>>
        ? never
        : K
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
  : [S] extends [object]
  ? [{ [K in keyof SchemaKeysObject<S>]: SchemaParameters<S[K]>[0] }]
  : [unknown] extends [S]
  ? [unknown]
  : never;

export type SchemaReturnType<S> = [S] extends [FunctionType]
  ? ResolvedValue<ReturnType<S>>
  : [S] extends [Primitive]
  ? S
  : [S] extends [RegExp]
  ? string
  : [S] extends [object]
  ? { [K in keyof S]: SchemaReturnType<S[K]> }
  : [unknown] extends [S]
  ? unknown
  : never;

export type SchemaValidatorFunction<S> = FunctionType<
  SchemaReturnType<S>,
  SchemaParameters<S>
>;
