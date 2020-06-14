import FunctionType from './FunctionType.ts';
import { RemoveAsync } from './io.ts';

type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

type EqualReformat<T> = T extends FunctionType
  ? [
      '$$FunctionType$$',
      EqualReformat<ReturnType<T>>,
      EqualReformat<Parameters<T>>,
    ]
  : T extends object // eslint-disable-line @typescript-eslint/ban-types
  ? {
      [K in keyof T]: EqualReformat<T[K]>;
    }
  : IfAny<T, never, T>;

type IfEqual<T, R, Y, N> = [R] extends [T] ? ([T] extends [R] ? Y : N) : N;

type IfDeepEqual<T, R, Y, N> = IfEqual<
  EqualReformat<T>,
  EqualReformat<R>,
  Y,
  N
>;

// exported types

export type ObjectProperty = string | number | symbol;

export type Primitive =
  | string
  | number
  | symbol
  | boolean
  | null
  | undefined
  | void
  | bigint;

export type Typeof = {
  string: string;
  number: number;
  object: object; // eslint-disable-line @typescript-eslint/ban-types
  boolean: boolean;
  symbol: symbol;
  bigint: bigint;
  undefined: undefined;
};

// https://stackoverflow.com/a/50159864/518153
export type Enum<E> = Record<keyof E, string | number> & {
  [k: number]: string;
};

export type ResolvedValue<T> =
  // do not escape T to [T] to support `number | Promise<string>`
  T extends PromiseLike<infer R> ? R : T;

export type IsAsync<S> = ResolvedValue<S> extends S
  ? unknown extends S
    ? unknown
    : false
  : RemoveAsync<S> extends never
  ? true
  : unknown;

export type MaybeAsync<T, V> = unknown extends IsAsync<T>
  ? PromiseLike<V> | V
  : true extends IsAsync<T>
  ? PromiseLike<V>
  : V;

export type RecursiveMerge<T> = [T] extends [Primitive]
  ? T
  : [T] extends [[unknown]]
  ? [RecursiveMerge<T[0]>]
  : [T] extends [[unknown?]]
  ? [RecursiveMerge<T[0]>?]
  : [T] extends [object] // eslint-disable-line @typescript-eslint/ban-types
  ? {
      [K in keyof T]: RecursiveMerge<T[K]>;
    }
  : T;

// export type RequiredKeys<T> = {
//   [k in keyof T]-?: undefined extends T[k] ? never : k;
// }[keyof T];

// export type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

// exported functions

export function typeCheck<T, R, Y = 'ok' extends T ? never : 'ok'>(
  ok: IfDeepEqual<T, R, IfAny<T, IfAny<R, Y, T>, IfAny<R, T, Y>>, T>,
): unknown {
  return ok;
}

export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return value && typeof (value as PromiseLike<unknown>).then === 'function';
}

export function isPrimitive(value: unknown): value is Primitive {
  return (
    (typeof value !== 'object' && typeof value !== 'function') || value === null
  );
}

export function deepConcat(): undefined;
export function deepConcat<A>(...values: [A]): A;
export function deepConcat<A, B>(...values: [A, B]): A & B;
export function deepConcat<A, B, C>(...values: [A, B, C]): A & B & C;
export function deepConcat<A, B, C, D>(...values: [A, B, C, D]): A & B & C & D;
export function deepConcat<A, B, C, D, E>(
  ...values: [A, B, C, D, E]
): A & B & C & D & E;
export function deepConcat<A, B, C, D, E, F>(
  ...values: [A, B, C, D, E, F]
): A & B & C & D & E & F;
export function deepConcat<A, B, C, D, E, F, G>(
  ...values: [A, B, C, D, E, F, G]
): A & B & C & D & E & F & G;
export function deepConcat<A, B, C, D, E, F, G, H>(
  ...values: [A, B, C, D, E, F, G, H]
): A & B & C & D & E & F & G & H;
export function deepConcat<T>(...values: unknown[]): unknown {
  if (values.length < 2) {
    return values[0];
  }

  values = values.filter((value) => value !== undefined);
  if (values.length < 2) {
    return values[0];
  }

  let base = values[0];
  if (typeof base !== 'object' || base === null) {
    for (let i = 1; i < values.length; i += 1) {
      if (values[i] !== base) {
        throw new TypeError(`Type mismatch on validation concat`);
      }
    }

    return base;
  }

  const keys: Record<string, unknown[]> = {};
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];

    if (typeof value !== 'object' || value === null) {
      throw new TypeError(`Type mismatch on validation concat`);
    }

    for (const key in value) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) continue;

      const keyVal = value[key as keyof typeof value];
      if (keyVal === undefined) continue;

      if (!keys[key]) {
        keys[key] = [];
      }
      keys[key].push(keyVal);
    }
  }

  if (Array.isArray(base)) {
    base = [];
  } else {
    base = {};
  }

  for (const key in keys) {
    (base as Record<string, unknown>)[key] = deepConcat(
      ...(keys[key] as [unknown]),
    );
  }

  return base;
}
