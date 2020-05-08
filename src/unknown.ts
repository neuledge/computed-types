import Validator, { ValidatorProxy } from './Validator';
import FunctionType, { FunctionParameters } from './schema/FunctionType';
import ErrorLike, { toError } from './schema/ErrorLike';
import { ObjectValidator } from './object';
import { StringValidator } from './string';
import { NumberValidator } from './number';
import { BooleanValidator } from './boolean';

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
  public object(
    error?: ErrorLike<[unknown]>,
  ): ValidatorProxy<ObjectValidator<P>> {
    return this.transform((input): object => {
      if (typeof input !== 'object') {
        throw toError(error || `Expect value to be object`, input);
      }

      return (input as unknown) as object;
    }, ObjectValidator);
  }

  public string(
    error?: ErrorLike<[unknown]>,
  ): ValidatorProxy<StringValidator<P>> {
    return this.transform((input): string => {
      if (typeof input === 'string') {
        return input;
      }

      if (
        input == null ||
        (typeof input === 'object' &&
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
    return this.transform((input): number => {
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
    return this.transform((input): boolean => {
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
}

const unknown = new UnknownValidator(
  (input: unknown): unknown => input,
).proxy();

export default unknown;
