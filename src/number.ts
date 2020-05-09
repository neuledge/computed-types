import Validator, { ValidatorProxy } from './Validator';
import { StringValidator } from './string';
import { ErrorLike } from './schema/errors';
import FunctionType, { FunctionParameters } from './schema/FunctionType';
import { type } from './schema/validations';

export class NumberValidator<
  P extends FunctionParameters = [number]
> extends Validator<FunctionType<number, P>> {
  public float(error?: ErrorLike<[number]>): ValidatorProxy<this> {
    return this.test(
      (val) => !isNaN(val) && Number.isFinite(val),
      error || `Expect value to be a number`,
    );
  }

  public integer(error?: ErrorLike<[number]>): ValidatorProxy<this> {
    return this.test(
      (val) => Number.isInteger(val),
      error || `Expect value to be an integer`,
    );
  }

  public toExponential(
    ...input: Parameters<number['toExponential']>
  ): ValidatorProxy<StringValidator<P>> {
    return this.transform(
      (val) => val.toExponential(...input),
      StringValidator,
    );
  }

  public toFixed(
    ...input: Parameters<number['toFixed']>
  ): ValidatorProxy<StringValidator<P>> {
    return this.transform((val) => val.toFixed(...input), StringValidator);
  }

  public toLocaleString(
    ...input: Parameters<number['toLocaleString']>
  ): ValidatorProxy<StringValidator<P>> {
    return this.transform(
      (val) => val.toLocaleString(...input),
      StringValidator,
    );
  }

  public toPrecision(
    ...input: Parameters<number['toPrecision']>
  ): ValidatorProxy<StringValidator<P>> {
    return this.transform((val) => val.toPrecision(...input), StringValidator);
  }

  public toString(
    ...input: Parameters<number['toString']>
  ): ValidatorProxy<StringValidator<P>> {
    return this.transform((val) => val.toString(...input), StringValidator);
  }

  public min(min: number, error?: ErrorLike<[number]>): ValidatorProxy<this> {
    return this.test(
      (val) => val >= min,
      error ||
        ((val): string =>
          `Expect value to be greater or equal than ${min} (actual: ${val})`),
    );
  }

  public max(max: number, error?: ErrorLike<[number]>): ValidatorProxy<this> {
    return this.test(
      (val) => val <= max,
      error ||
        ((val): string =>
          `Expect value to be lower or equal than ${max} (actual: ${val})`),
    );
  }

  public gte = this.min;
  public lte = this.max;

  public gt(
    boundary: number,
    error?: ErrorLike<[number]>,
  ): ValidatorProxy<this> {
    return this.test(
      (val) => val > boundary,
      error ||
        ((val): string =>
          `Expect value to be greater than ${boundary} (actual: ${val})`),
    );
  }

  public lt(
    boundary: number,
    error?: ErrorLike<[number]>,
  ): ValidatorProxy<this> {
    return this.test(
      (val) => val < boundary,
      error ||
        ((val): string =>
          `Expect value to be lower than ${boundary} (actual: ${val})`),
    );
  }

  public between(
    min: number,
    max: number,
    error?: ErrorLike<[number]>,
  ): ValidatorProxy<this> {
    return this.test(
      (val) => val >= min && val <= max,
      error ||
        ((val): string =>
          `Expect value to be between ${min} and ${max} (actual: ${val})`),
    );
  }
}

const number = new NumberValidator(type('number')).proxy();

export default number;
