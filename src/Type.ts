import {
  AllowPartial,
  AnyType,
  FunctionType,
  Primitive,
  ResolvedValue,
} from './utils';

export type Output<T> = [T] extends [FunctionType]
  ? ResolvedValue<ReturnType<T>>
  : [T] extends [Primitive]
  ? T
  : [T] extends [RegExp]
  ? string
  : [T] extends [object]
  ? { [K in keyof T]: Output<T[K]> }
  : never;

// type RequiredInput<T> = T extends FunctionType
//   ? Parameters<T>[0]
//   : T extends Primitive
//   ? T
//   : T extends object
//   ? { [K in keyof T]: RequiredInput<T[K]> }
//   : never;

// export type Input<T> = AllowPartial<RequiredInput<T>>;

type OptionalInputKeys<T> = Exclude<
  {
    [K in keyof T]: [T[K]] extends [FunctionType]
      ? Parameters<T[K]> extends Required<Parameters<T[K]>>
        ? never
        : K // : undefined extends ResolvedValue<ReturnType<T[K]>> // ? K // : never
      : undefined extends T[K]
      ? K
      : never;
  }[keyof T],
  undefined
>;

type RequiredInputKeys<T> = Exclude<keyof T, OptionalInputKeys<T>>;

export type Input<T> = T extends FunctionType
  ? Parameters<T>[0]
  : T extends Primitive
  ? T
  : T extends RegExp
  ? string
  : T extends Array<AnyType>
  ? { [K in keyof T]: Input<T[K]> }
  : T extends object
  ? { [K in RequiredInputKeys<T>]: Input<T[K]> } &
      { [K in OptionalInputKeys<T>]?: Input<T[K]> }
  : never;

type Type<T> = AllowPartial<Output<T>>;

export default Type;
