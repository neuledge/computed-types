import { SchemaParameters, SchemaReturnType } from './io';
import FunctionType from './FunctionType';
import compiler from './compiler';
import { isPromiseLike } from './utils';
import { ErrorLike } from './errors';

export function either<A>(
  a: A,
): FunctionType<SchemaReturnType<A>, SchemaParameters<A>>;
export function either<A, B>(
  a: A,
  b: B,
): FunctionType<
  SchemaReturnType<A> | SchemaReturnType<B>,
  SchemaParameters<A | B>
>;
export function either<A, B, C>(
  a: A,
  b: B,
  c: C,
): FunctionType<
  SchemaReturnType<A> | SchemaReturnType<B> | SchemaReturnType<C>,
  SchemaParameters<A | B | C>
>;
export function either<A, B, C, D>(
  a: A,
  b: B,
  c: C,
  d: D,
): FunctionType<
  | SchemaReturnType<A>
  | SchemaReturnType<B>
  | SchemaReturnType<C>
  | SchemaReturnType<D>,
  SchemaParameters<A | B | C | D>
>;
export function either<A, B, C, D, E>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
): FunctionType<
  | SchemaReturnType<A>
  | SchemaReturnType<B>
  | SchemaReturnType<C>
  | SchemaReturnType<D>
  | SchemaReturnType<E>,
  SchemaParameters<A | B | C | D | E>
>;
export function either<A, B, C, D, E, F>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
): FunctionType<
  | SchemaReturnType<A>
  | SchemaReturnType<B>
  | SchemaReturnType<C>
  | SchemaReturnType<D>
  | SchemaReturnType<E>
  | SchemaReturnType<F>,
  SchemaParameters<A | B | C | D | E | F>
>;
export function either<A, B, C, D, E, F, G>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
): FunctionType<
  | SchemaReturnType<A>
  | SchemaReturnType<B>
  | SchemaReturnType<C>
  | SchemaReturnType<D>
  | SchemaReturnType<E>
  | SchemaReturnType<F>
  | SchemaReturnType<G>,
  SchemaParameters<A | B | C | D | E | F | G>
>;
export function either<A, B, C, D, E, F, G, H>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
  h: H,
): FunctionType<
  | SchemaReturnType<A>
  | SchemaReturnType<B>
  | SchemaReturnType<C>
  | SchemaReturnType<D>
  | SchemaReturnType<E>
  | SchemaReturnType<F>
  | SchemaReturnType<G>
  | SchemaReturnType<H>,
  SchemaParameters<A | B | C | D | E | F | G | H>
>;
export function either<A, S>(
  ...candidates: [A, ...S[]]
): FunctionType<
  SchemaReturnType<A> | SchemaReturnType<S>,
  SchemaParameters<A | S>
> {
  if (!candidates.length) {
    throw new RangeError(`Expecting at least one candidate`);
  }

  const validators = candidates.map((schema) => compiler(schema));

  return ((...args: unknown[]): unknown => {
    let i = 0;

    const next = (): unknown => {
      const validator = validators[i++];

      let res;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res = validator(...(args as any));
      } catch (e) {
        if (i >= candidates.length) {
          throw e;
        }

        return next();
      }

      if (!isPromiseLike(res)) {
        return res;
      }

      return res.then(null, (e) => {
        if (i >= candidates.length) {
          throw e;
        }

        return next();
      });
    };

    return next();
  }) as FunctionType<
    SchemaReturnType<A> | SchemaReturnType<S>,
    SchemaParameters<A | S>
  >;
}

export function optional<S>(
  schema: S,
  error?: ErrorLike<SchemaParameters<S>>,
): FunctionType<
  SchemaReturnType<S> | undefined,
  SchemaParameters<S, [undefined?]>
> {
  const validator = compiler(schema, error);

  return (
    ...args: SchemaParameters<S, [undefined?]>
  ): SchemaReturnType<S> | undefined => {
    if (args[0] === undefined) {
      return undefined;
    }

    return validator(...(args as SchemaParameters<S>));
  };
}
