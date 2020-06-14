import {
  MergeSchemaParameters,
  SchemaParameters,
  SchemaResolveType,
  SchemaReturnType,
} from './io.ts';
import FunctionType from './FunctionType.ts';
import compiler from './compiler.ts';
import { deepConcat, isPromiseLike } from './utils.ts';
import { findSwitchKey, generateSwitch } from './switch.ts';

export function either<A>(
  ...candidates: [A]
): FunctionType<SchemaReturnType<A>, SchemaParameters<A>>;
export function either<A, B>(
  ...candidates: [A, B]
): FunctionType<
  SchemaReturnType<A> | SchemaReturnType<B>,
  MergeSchemaParameters<SchemaParameters<A> | SchemaParameters<B>>
>;
export function either<A, B, C>(
  ...candidates: [A, B, C]
): FunctionType<
  SchemaReturnType<A> | SchemaReturnType<B> | SchemaReturnType<C>,
  MergeSchemaParameters<
    SchemaParameters<A> | SchemaParameters<B> | SchemaParameters<C>
  >
>;
export function either<A, B, C, D>(
  ...candidates: [A, B, C, D]
): FunctionType<
  | SchemaReturnType<A>
  | SchemaReturnType<B>
  | SchemaReturnType<C>
  | SchemaReturnType<D>,
  MergeSchemaParameters<
    | SchemaParameters<A>
    | SchemaParameters<B>
    | SchemaParameters<C>
    | SchemaParameters<D>
  >
>;
export function either<A, B, C, D, E>(
  ...candidates: [A, B, C, D, E]
): FunctionType<
  | SchemaReturnType<A>
  | SchemaReturnType<B>
  | SchemaReturnType<C>
  | SchemaReturnType<D>
  | SchemaReturnType<E>,
  MergeSchemaParameters<
    | SchemaParameters<A>
    | SchemaParameters<B>
    | SchemaParameters<C>
    | SchemaParameters<D>
    | SchemaParameters<E>
  >
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
  MergeSchemaParameters<
    | SchemaParameters<A>
    | SchemaParameters<B>
    | SchemaParameters<C>
    | SchemaParameters<D>
    | SchemaParameters<E>
    | SchemaParameters<F>
  >
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
  MergeSchemaParameters<
    | SchemaParameters<A>
    | SchemaParameters<B>
    | SchemaParameters<C>
    | SchemaParameters<D>
    | SchemaParameters<E>
    | SchemaParameters<F>
    | SchemaParameters<G>
  >
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
  MergeSchemaParameters<
    | SchemaParameters<A>
    | SchemaParameters<B>
    | SchemaParameters<C>
    | SchemaParameters<D>
    | SchemaParameters<E>
    | SchemaParameters<F>
    | SchemaParameters<G>
    | SchemaParameters<H>
  >
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

  const switchKey = findSwitchKey(...candidates);
  if (switchKey) {
    return generateSwitch(switchKey, validators) as FunctionType<
      SchemaReturnType<A> | SchemaReturnType<S>,
      SchemaParameters<A | S>
    >;
  }

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

export function merge<A>(
  ...args: [A]
): FunctionType<
  SchemaReturnType<A>,
  MergeSchemaParameters<SchemaParameters<A>>
>;
export function merge<A, B>(
  ...args: [A, B]
): FunctionType<
  SchemaReturnType<A & B, SchemaResolveType<A> & SchemaResolveType<B>>,
  MergeSchemaParameters<SchemaParameters<A> & SchemaParameters<B>>
>;
export function merge<A, B, C>(
  ...args: [A, B, C]
): FunctionType<
  SchemaReturnType<
    A & B & C,
    SchemaResolveType<A> & SchemaResolveType<B> & SchemaResolveType<C>
  >,
  MergeSchemaParameters<
    SchemaParameters<A> & SchemaParameters<B> & SchemaParameters<C>
  >
>;
export function merge<A, B, C, D>(
  ...args: [A, B, C, D]
): FunctionType<
  SchemaReturnType<
    A & B & C & D,
    SchemaResolveType<A> &
      SchemaResolveType<B> &
      SchemaResolveType<C> &
      SchemaResolveType<D>
  >,
  MergeSchemaParameters<
    SchemaParameters<A> &
      SchemaParameters<B> &
      SchemaParameters<C> &
      SchemaParameters<D>
  >
>;
export function merge<A, B, C, D, E>(
  ...args: [A, B, C, D, E]
): FunctionType<
  SchemaReturnType<
    A & B & C & D & E,
    SchemaResolveType<A> &
      SchemaResolveType<B> &
      SchemaResolveType<C> &
      SchemaResolveType<D> &
      SchemaResolveType<E>
  >,
  MergeSchemaParameters<
    SchemaParameters<A> &
      SchemaParameters<B> &
      SchemaParameters<C> &
      SchemaParameters<D> &
      SchemaParameters<E>
  >
>;
export function merge<A, B, C, D, E, F>(
  ...args: [A, B, C, D, E, F]
): FunctionType<
  SchemaReturnType<
    A & B & C & D & E & F,
    SchemaResolveType<A> &
      SchemaResolveType<B> &
      SchemaResolveType<C> &
      SchemaResolveType<D> &
      SchemaResolveType<E> &
      SchemaResolveType<F>
  >,
  MergeSchemaParameters<
    SchemaParameters<A> &
      SchemaParameters<B> &
      SchemaParameters<C> &
      SchemaParameters<D> &
      SchemaParameters<E> &
      SchemaParameters<F>
  >
>;
// export function merge<A, B, C, D, E, F, G>(
//   ...args: [A, B, C, D, E, F, G]
// ): FunctionType<
//   SchemaReturnType<
//     A & B & C & D & E & F & G,
//     SchemaResolveType<A> &
//       SchemaResolveType<B> &
//       SchemaResolveType<C> &
//       SchemaResolveType<D> &
//       SchemaResolveType<E> &
//       SchemaResolveType<F> &
//       SchemaResolveType<G>
//   >,
//   MergeSchemaParameters<
//     SchemaParameters<A> &
//       SchemaParameters<B> &
//       SchemaParameters<C> &
//       SchemaParameters<D> &
//       SchemaParameters<E> &
//       SchemaParameters<F> &
//       SchemaParameters<G>
//   >
// >;
// export function merge<A, B, C, D, E, F, G, H>(
//   ...args: [A, B, C, D, E, F, G, H]
// ): FunctionType<
//   SchemaReturnType<
//     A & B & C & D & E & F & G & H,
//     SchemaResolveType<A> &
//       SchemaResolveType<B> &
//       SchemaResolveType<C> &
//       SchemaResolveType<D> &
//       SchemaResolveType<E> &
//       SchemaResolveType<F> &
//       SchemaResolveType<G> &
//       SchemaResolveType<H>
//   >,
//   MergeSchemaParameters<
//     SchemaParameters<A> &
//       SchemaParameters<B> &
//       SchemaParameters<C> &
//       SchemaParameters<D> &
//       SchemaParameters<E> &
//       SchemaParameters<F> &
//       SchemaParameters<G> &
//       SchemaParameters<H>
//   >
// >;
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
  MergeSchemaParameters<Parameters<F> | [(undefined | null)?]>
> {
  return (
    ...args: MergeSchemaParameters<Parameters<F> | [(undefined | null)?]>
  ): ReturnType<F> | R => {
    if (args[0] == null || args[0] === '') {
      return defaultValue as R;
    }

    return validator(...args);
  };
}
