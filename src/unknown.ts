import Validator, { ValidatorProxy } from './Validator.ts';
import FunctionType, { FunctionParameters } from './schema/FunctionType.ts';
import { ErrorLike, toError } from './schema/errors.ts';
import { ObjectValidator } from './object.ts';
import { StringValidator } from './string.ts';
import { NumberValidator } from './number.ts';
import { BooleanValidator } from './boolean.ts';
import { SchemaResolveType } from './schema/io.ts';
import compiler from './schema/compiler.ts';
import { ArrayValidator } from './array.ts';
import { array, enumValue, type } from './schema/validations.ts';
import { Enum } from './schema/utils.ts';

const BOOL_MAP = {
  true: true,
  false: false,
  t: true,
  f: false,
  yes: true,
  no: false,
  y: true,
  n: false,
  1: true,
  0: false,
};

export class UnknownValidator<
  P extends FunctionParameters = [unknown]
> extends Validator<FunctionType<unknown, P>> {
  public schema<S>(
    schema: S,
    error?: ErrorLike<[unknown]>,
  ): ValidatorProxy<Validator<FunctionType<SchemaResolveType<S>, P>>> {
    return this.transform(
      compiler<unknown>(schema, error) as FunctionType<
        SchemaResolveType<S>,
        [unknown]
      >,
      Validator,
    );
  }

  public object(
    error?: ErrorLike<[unknown]>,
  ): ValidatorProxy<ObjectValidator<P>> {
    return this.transform(type('object', error), ObjectValidator);
  }

  public array(
    error?: ErrorLike<[unknown]>,
  ): ValidatorProxy<ArrayValidator<unknown[], P>> {
    return this.transform(array(null, error), ArrayValidator);
  }

  public string(
    error?: ErrorLike<[unknown]>,
  ): ValidatorProxy<StringValidator<P>> {
    return this.transform((input) => {
      if (typeof input === 'string') {
        return input;
      }

      if (
        input == null ||
        (typeof input === 'object' &&
          // eslint-disable-next-line @typescript-eslint/ban-types
          ((input as unknown) as object).toString === Object.prototype.toString)
      ) {
        throw toError(error || `Expect value to be string`, input);
      }

      return String(input);
    }, StringValidator);
  }

  public number(
    error?: ErrorLike<[unknown]>,
  ): ValidatorProxy<NumberValidator<P>> {
    return this.transform((input) => {
      if (typeof input === 'number') {
        return input;
      }

      const value = Number(input);

      if (isNaN(value) && (input as unknown) !== 'NaN') {
        throw toError(error || `Unknown number value`, input);
      }

      return value;
    }, NumberValidator);
  }

  public boolean(
    error?: ErrorLike<[unknown]>,
  ): ValidatorProxy<BooleanValidator<P>> {
    return this.transform((input) => {
      if (typeof input === 'boolean') {
        return input;
      }

      const key = String(input).trim().toLowerCase();
      const value = BOOL_MAP[key as keyof typeof BOOL_MAP];

      if (value == null) {
        throw toError(error || `Unknown boolean value`, input);
      }

      return value;
    }, BooleanValidator);
  }

  public enum<E extends Enum<E>>(
    value: E,
    error?: ErrorLike<[unknown]>,
  ): ValidatorProxy<Validator<FunctionType<E[keyof E], P>>> {
    return this.transform(enumValue(value, error), Validator);
  }
}

const unknown = new UnknownValidator(
  (input: unknown): unknown => input,
).proxy();

export default unknown;
