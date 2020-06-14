import Validator, { ValidatorProxy } from './Validator.ts';
import { StringValidator } from './string.ts';
import { ErrorLike } from './schema/errors.ts';
import FunctionType, { FunctionParameters } from './schema/FunctionType.ts';
import { type } from './schema/validations.ts';

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
    ...args: Parameters<number['toExponential']>
  ): ValidatorProxy<StringValidator<P>> {
    return this.transform((val) => val.toExponential(...args), StringValidator);
  }

  public toFixed(
    ...args: Parameters<number['toFixed']>
  ): ValidatorProxy<StringValidator<P>> {
    return this.transform((val) => val.toFixed(...args), StringValidator);
  }

  public toLocaleString(
    ...args: Parameters<number['toLocaleString']>
  ): ValidatorProxy<StringValidator<P>> {
    return this.transform(
      (val) => val.toLocaleString(...args),
      StringValidator,
    );
  }

  public toPrecision(
    ...args: Parameters<number['toPrecision']>
  ): ValidatorProxy<StringValidator<P>> {
    return this.transform((val) => val.toPrecision(...args), StringValidator);
  }

  public toString(
    ...args: Parameters<number['toString']>
  ): ValidatorProxy<StringValidator<P>> {
    return this.transform((val) => val.toString(...args), StringValidator);
  }

  public min(min: number, error?: ErrorLike<[number]>): ValidatorProxy<this> {
    return this.test(
      (val) => val >= min,
      error ||
        ((val: number): RangeError =>
          new RangeError(
            `Expect value to be greater or equal than ${min} (actual: ${val})`,
          )),
    );
  }

  public max(max: number, error?: ErrorLike<[number]>): ValidatorProxy<this> {
    return this.test(
      (val) => val <= max,
      error ||
        ((val: number): RangeError =>
          new RangeError(
            `Expect value to be lower or equal than ${max} (actual: ${val})`,
          )),
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
        ((val: number): RangeError =>
          new RangeError(
            `Expect value to be greater than ${boundary} (actual: ${val})`,
          )),
    );
  }

  public lt(
    boundary: number,
    error?: ErrorLike<[number]>,
  ): ValidatorProxy<this> {
    return this.test(
      (val) => val < boundary,
      error ||
        ((val: number): RangeError =>
          new RangeError(
            `Expect value to be lower than ${boundary} (actual: ${val})`,
          )),
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
        ((val: number): RangeError =>
          new RangeError(
            `Expect value to be between ${min} and ${max} (actual: ${val})`,
          )),
    );
  }
}

const number = new NumberValidator(type('number')).proxy();

export default number;
