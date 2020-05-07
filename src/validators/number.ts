import Validator, { Input, ValidatorProxy } from './Validator';
import { StringValidator } from './string';
import ErrorLike from './ErrorLike';

export class NumberValidator<I extends Input = [number]> extends Validator<
  number,
  I
> {
  public float(error?: ErrorLike<[number]>): ValidatorProxy<number, I, this> {
    return this.test(
      (val) => !isNaN(val) && Number.isFinite(val),
      error || `Expect value to be a number`,
    );
  }

  public integer(error?: ErrorLike<[number]>): ValidatorProxy<number, I, this> {
    return this.test(
      (val) => Number.isInteger(val),
      error || `Expect value to be an integer`,
    );
  }

  public toExponential(
    ...input: Parameters<number['toExponential']>
  ): ValidatorProxy<string, I, StringValidator<I>> {
    return this.convert<string, StringValidator<I>, typeof StringValidator>(
      StringValidator,
      (val) => val.toExponential(...input),
    );
  }

  public toFixed(
    ...input: Parameters<number['toFixed']>
  ): ValidatorProxy<string, I, StringValidator<I>> {
    return this.convert<string, StringValidator<I>, typeof StringValidator>(
      StringValidator,
      (val) => val.toFixed(...input),
    );
  }

  public toLocaleString(
    ...input: Parameters<number['toLocaleString']>
  ): ValidatorProxy<string, I, StringValidator<I>> {
    return this.convert<string, StringValidator<I>, typeof StringValidator>(
      StringValidator,
      (val) => val.toLocaleString(...input),
    );
  }

  public toPrecision(
    ...input: Parameters<number['toPrecision']>
  ): ValidatorProxy<string, I, StringValidator<I>> {
    return this.convert<string, StringValidator<I>, typeof StringValidator>(
      StringValidator,
      (val) => val.toPrecision(...input),
    );
  }

  public toString(
    ...input: Parameters<number['toString']>
  ): ValidatorProxy<string, I, StringValidator<I>> {
    return this.convert<string, StringValidator<I>, typeof StringValidator>(
      StringValidator,
      (val) => val.toString(...input),
    );
  }

  public min(
    min: number,
    error?: ErrorLike<[number]>,
  ): ValidatorProxy<number, I, this> {
    return this.test(
      (val) => val >= min,
      error ||
        ((val): string =>
          `Expect value to be greater or equal than ${min} (actual: ${val})`),
    );
  }

  public max(
    max: number,
    error?: ErrorLike<[number]>,
  ): ValidatorProxy<number, I, this> {
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
  ): ValidatorProxy<number, I, this> {
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
  ): ValidatorProxy<number, I, this> {
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
  ): ValidatorProxy<number, I, this> {
    return this.test(
      (val) => val >= min && val <= max,
      error ||
        ((val): string =>
          `Expect value to be between ${min} and ${max} (actual: ${val})`),
    );
  }
}

const number = NumberValidator.proxy<number, [number], NumberValidator>(
  (input: number): number => {
    if (typeof input !== 'number') {
      throw TypeError(`Expect value to be number`);
    }

    return input;
  },
);

export default number;
