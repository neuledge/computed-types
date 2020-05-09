import { SchemaValidatorFunction } from './io';
import FunctionType from './FunctionType';

export function either<A>(a: A): SchemaValidatorFunction<A>;
export function either<A, B>(a: A, b: B): SchemaValidatorFunction<A | B>;
export function either<A, B, C>(
  a: A,
  b: B,
  c: C,
): SchemaValidatorFunction<A | B | C>;
export function either(
  ...candidates: [unknown, ...unknown[]]
): FunctionType<unknown, unknown[]> {
  if (!candidates.length) {
    throw new RangeError(`Expecting at least one candidate`);
  }

  // TODO either
  throw new Error('not implemented');
}
