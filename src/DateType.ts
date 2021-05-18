import Validator, { ValidatorProxy } from './Validator';
import { StringValidator } from './string';
import { ErrorLike, toError } from './schema/errors';
import FunctionType, { FunctionParameters } from './schema/FunctionType';
import { NumberValidator } from './number';

export class DateValidator<
  P extends FunctionParameters = [Date],
> extends Validator<FunctionType<Date, P>> {
  public toISOString(
    ...args: Parameters<Date['toISOString']>
  ): ValidatorProxy<StringValidator<P>> {
    return this.transform((val) => val.toISOString(...args), StringValidator);
  }

  public getTime(
    ...args: Parameters<Date['getTime']>
  ): ValidatorProxy<NumberValidator<P>> {
    return this.transform((val) => val.getTime(...args), NumberValidator);
  }

  public min(min: Date, error?: ErrorLike<[Date]>): ValidatorProxy<this> {
    return this.test(
      (val) => val >= min,
      error ||
        ((val): RangeError =>
          new RangeError(
            `Expect date to be greater or equal than ${min} (actual: ${val})`,
          )),
    );
  }

  public max(max: Date, error?: ErrorLike<[Date]>): ValidatorProxy<this> {
    return this.test(
      (val) => val <= max,
      error ||
        ((val): RangeError =>
          new RangeError(
            `Expect date to be lower or equal than ${max} (actual: ${val})`,
          )),
    );
  }

  public gte = this.min;
  public lte = this.max;

  public gt(boundary: Date, error?: ErrorLike<[Date]>): ValidatorProxy<this> {
    return this.test(
      (val) => val > boundary,
      error ||
        ((val): RangeError =>
          new RangeError(
            `Expect date to be greater than ${boundary} (actual: ${val})`,
          )),
    );
  }

  public lt(boundary: Date, error?: ErrorLike<[Date]>): ValidatorProxy<this> {
    return this.test(
      (val) => val < boundary,
      error ||
        ((val): RangeError =>
          new RangeError(
            `Expect date to be lower than ${boundary} (actual: ${val})`,
          )),
    );
  }

  public between(
    min: Date,
    max: Date,
    error?: ErrorLike<[Date]>,
  ): ValidatorProxy<this> {
    return this.test(
      (val) => val >= min && val <= max,
      error ||
        ((val): RangeError =>
          new RangeError(
            `Expect date to be between ${min} and ${max} (actual: ${val})`,
          )),
    );
  }
}

const DateType = new DateValidator((input) => {
  if (!(input instanceof Date)) {
    throw toError(`Expect value to be instance of Date`);
  }

  return input;
}).proxy();

export default DateType;
