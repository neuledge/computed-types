import {
  SchemaParameters,
  SchemaReturnType,
  SchemaValidatorFunction,
} from './io';
import FunctionType, { MergeFirstParameter } from './FunctionType';
import compiler from './compiler';
import { deepConcat, isPromiseLike } from './utils';

export function either<A>(
  ...candidates: [A]
): FunctionType<SchemaReturnType<A>, SchemaParameters<A>>;
export function either<A, B>(
  ...candidates: [A, B]
): FunctionType<
  SchemaReturnType<A> | SchemaReturnType<B>,
  SchemaParameters<A | B>
>;
export function either<A, B, C>(
  ...candidates: [A, B, C]
): FunctionType<
  SchemaReturnType<A> | SchemaReturnType<B> | SchemaReturnType<C>,
  SchemaParameters<A | B | C>
>;
export function either<A, B, C, D>(
  ...candidates: [A, B, C, D]
): FunctionType<
  | SchemaReturnType<A>
  | SchemaReturnType<B>
  | SchemaReturnType<C>
  | SchemaReturnType<D>,
  SchemaParameters<A | B | C | D>
>;
export function either<A, B, C, D, E>(
  ...candidates: [A, B, C, D, E]
): FunctionType<
  | SchemaReturnType<A>
  | SchemaReturnType<B>
  | SchemaReturnType<C>
  | SchemaReturnType<D>
  | SchemaReturnType<E>,
  SchemaParameters<A | B | C | D | E>
>;
export function either<A, B, C, D, E, F>(
  ...candidates: [A, B, C, D, E, F]
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
  ...candidates: [A, B, C, D, E, F, G]
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
  ...candidates: [A, B, C, D, E, F, G, H]
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
    throw new RangeError(`Expecting at least one argument`);
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

export function merge<A>(...args: [A]): SchemaValidatorFunction<A>;
export function merge<A, B>(...args: [A, B]): SchemaValidatorFunction<A & B>;
export function merge<A, B, C>(
  ...args: [A, B, C]
): SchemaValidatorFunction<A & B & C>;
export function merge<A, B, C, D>(
  ...args: [A, B, C, D]
): SchemaValidatorFunction<A & B & C & D>;
export function merge<A, B, C, D, E>(
  ...args: [A, B, C, D, E]
): SchemaValidatorFunction<A & B & C & D & E>;
export function merge<A, B, C, D, E, F>(
  ...args: [A, B, C, D, E, F]
): SchemaValidatorFunction<A & B & C & D & E & F>;
export function merge<A, B, C, D, E, F, G>(
  ...args: [A, B, C, D, E, F, G]
): SchemaValidatorFunction<A & B & C & D & E & F & G>;
export function merge<A, B, C, D, E, F, G, H>(
  ...args: [A, B, C, D, E, F, G, H]
): SchemaValidatorFunction<A & B & C & D & E & F & G & H>;
export function merge(...args: [unknown, ...unknown[]]): FunctionType {
  if (!args.length) {
    throw new RangeError(`Expecting at least one argument`);
  }

  const validators = args.map((schema) => compiler<unknown>(schema));
  const validatorsCount = validators.length;

  if (validatorsCount === 1) {
    return validators[0];
  }

  return (...args: unknown[]): unknown => {
    let isAsync;
    const res = [];

    for (let i = 0; i < validatorsCount; i += 1) {
      const ret = validators[i](...(args as [unknown]));
      if (isPromiseLike(ret)) {
        isAsync = true;
      }

      res.push(ret);
    }

    if (!isAsync) {
      return deepConcat(...(res as [unknown, unknown[]]));
    }

    return Promise.all(res).then((resolved) =>
      deepConcat(...(resolved as [unknown])),
    );
  };
}

export function optional<F extends FunctionType, R = undefined>(
  validator: F,
  defaultValue?: R,
): FunctionType<
  ReturnType<F> | R,
  MergeFirstParameter<Parameters<F> | [undefined?]>
> {
  return (
    ...args: MergeFirstParameter<Parameters<F> | [undefined?]>
  ): ReturnType<F> | R => {
    if (args[0] === undefined) {
      return defaultValue as R;
    }

    return validator(...args);
  };
}
