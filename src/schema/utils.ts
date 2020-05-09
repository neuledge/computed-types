import FunctionType from './FunctionType';

type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

type RemoveAny<T> = [T] extends [object]
  ? {
      [K in keyof T]: RemoveAny<T[K]>;
    }
  : IfAny<T, never, T>;

type IfEqual<T, R, Y, N> = [R] extends [T] ? ([T] extends [R] ? Y : N) : N;

type IfDeepEqual<T, R, Y, N> = [T] extends [FunctionType]
  ? [R] extends [FunctionType]
    ? IfEqual<
        RemoveAny<ReturnType<T>>,
        RemoveAny<ReturnType<R>>,
        IfEqual<RemoveAny<Parameters<T>>, RemoveAny<Parameters<R>>, Y, N>,
        N
      >
    : N
  : IfEqual<RemoveAny<T>, RemoveAny<R>, Y, N>;

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
  object: object;
  boolean: boolean;
  symbol: symbol;
  bigint: bigint;
  undefined: undefined;
};

export type ResolvedValue<T> =
  // do not escape T to [T] to support `number | Promise<string>`
  T extends PromiseLike<infer R> ? R : T;

// export type RequiredKeys<T> = {
//   [k in keyof T]-?: undefined extends T[k] ? never : k;
// }[keyof T];

// export type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

// exported functions

export function typeCheck<T, R, Y = ['ok'] extends [T] ? never : 'ok'>(
  ok: IfDeepEqual<T, R, IfAny<T, IfAny<R, Y, T>, IfAny<R, T, Y>>, T>,
): unknown {
  return ok;
}

export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return value && typeof (value as PromiseLike<unknown>).then === 'function';
}
