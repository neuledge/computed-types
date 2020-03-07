import { AllowPartial, FunctionType, Primitive, ResolvedValue } from './utils';

export type Output<T> = T extends FunctionType
  ? ResolvedValue<ReturnType<T>>
  : T extends Primitive
  ? T
  : T extends object
  ? { [K in keyof T]: Output<T[K]> }
  : never;

type RequiredInput<T> = T extends FunctionType
  ? Parameters<T>[0]
  : T extends Primitive
  ? T
  : T extends object
  ? { [K in keyof T]: RequiredInput<T[K]> }
  : never;

export type Input<T> = AllowPartial<RequiredInput<T>>;

type Type<T> = AllowPartial<Output<T>>;

export default Type;
