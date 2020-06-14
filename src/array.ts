import Validator, { ValidatorProxy } from './Validator.ts';
import FunctionType, { FunctionParameters } from './schema/FunctionType.ts';
import { array as arrayValidator } from './schema/validations.ts';
import { ErrorLike } from './schema/errors.ts';
import {
  SchemaParameters,
  SchemaResolveType,
  SchemaReturnType,
} from './schema/io.ts';
import compiler from './schema/compiler.ts';
import { isPromiseLike, ResolvedValue } from './schema/utils.ts';

export class ArrayValidator<
  R extends unknown[] | PromiseLike<unknown[]> = unknown[],
  P extends FunctionParameters = [R]
> extends Validator<FunctionType<R, P>> {
  public of<S>(
    schema: S,
    error?: ErrorLike<SchemaParameters<S>>,
  ): ValidatorProxy<
    ArrayValidator<SchemaReturnType<S, SchemaResolveType<S>[]>, P>
  > {
    const validator = compiler(schema, { error });

    return (this.transform((arr: ResolvedValue<R>):
      | PromiseLike<SchemaResolveType<S>[]>
      | SchemaResolveType<S>[] => {
      let isAsync;
      const items = arr.map((item):
        | SchemaResolveType<S>
        | PromiseLike<SchemaResolveType<S>> => {
        const ret = validator(...([item] as SchemaParameters<S>));
        if (isPromiseLike(ret)) {
          isAsync = true;
        }

        return ret;
      });

      if (!isAsync) {
        return items as SchemaResolveType<S>[];
      }

      return Promise.all(items);
    }) as unknown) as ValidatorProxy<
      ArrayValidator<SchemaReturnType<S, SchemaResolveType<S>[]>, P>
    >;
  }

  public min(
    length: number,
    error?: ErrorLike<[ResolvedValue<R>]>,
  ): ValidatorProxy<this> {
    return this.test(
      (arr) => arr.length >= length,
      error ||
        ((arr: ResolvedValue<R>): string =>
          `Expect array to be minimum of ${length} items (actual: ${arr.length})`),
    );
  }

  public max(
    length: number,
    error?: ErrorLike<[ResolvedValue<R>]>,
  ): ValidatorProxy<this> {
    return this.test(
      (arr) => arr.length <= length,
      error ||
        ((arr: ResolvedValue<R>): string =>
          `Expect array to be maximum of ${length} items (actual: ${arr.length})`),
    );
  }

  public between(
    minLength: number,
    maxLength: number,
    error?: ErrorLike<[ResolvedValue<R>]>,
  ): ValidatorProxy<this> {
    return this.test(
      (arr) => arr.length >= minLength && arr.length <= maxLength,
      error ||
        ((arr: ResolvedValue<R>): string =>
          `Expect array to be between ${minLength} and ${maxLength} items (actual: ${arr.length})`),
    );
  }
}

const array = new ArrayValidator(arrayValidator()).proxy() as {
  of<S>(
    schema: S,
    error?: ErrorLike<SchemaParameters<S>>,
  ): ValidatorProxy<
    ArrayValidator<
      SchemaReturnType<S, SchemaResolveType<S>[]>,
      [SchemaParameters<S>[0][]]
    >
  >;
} & ValidatorProxy<ArrayValidator>;

export default array;
