// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyType = any;

export type Primitive =
  | string
  | number
  | symbol
  | boolean
  | null
  | undefined
  | void
  | bigint;

export type FunctionType<T = AnyType, A extends Array<AnyType> = AnyType> = (
  ...args: A
) => T;

export type ObjectProperty = string | number | symbol;

export type ResolvedValue<T> = T extends PromiseLike<infer R> ? R : T;

type OptionalKeys<T> = Exclude<
  {
    [K in keyof T]: undefined extends T[K]
      ? AnyType extends T[K]
        ? never
        : K
      : never;
  }[keyof T],
  undefined
>;

type RequiredKeys<T> = Exclude<keyof T, OptionalKeys<T>>;

export type AllowPartial<T> = T extends object
  ? OptionalKeys<T> extends never
    ? {
        [K in RequiredKeys<T>]: AllowPartial<T[K]>;
      }
    : {
        [K in RequiredKeys<T>]: AllowPartial<Exclude<T[K], undefined>>;
      } &
        {
          [K in OptionalKeys<T>]?: AllowPartial<T[K]>;
        }
  : T;

export function isPromiseLike(value: unknown): value is PromiseLike<AnyType> {
  return value && typeof (value as PromiseLike<unknown>).then === 'function';
}
