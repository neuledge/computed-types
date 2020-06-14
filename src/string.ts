import { ErrorLike } from './schema/errors.ts';
import Validator, { ValidatorProxy } from './Validator.ts';
import FunctionType, { FunctionParameters } from './schema/FunctionType.ts';
import { regexp, type } from './schema/validations.ts';

export class StringValidator<
  P extends FunctionParameters = [string]
> extends Validator<FunctionType<string, P>> {
  public toLowerCase(): ValidatorProxy<this> {
    return this.transform((str) => str.toLowerCase());
  }

  public toUpperCase(): ValidatorProxy<this> {
    return this.transform((str) => str.toUpperCase());
  }

  public toLocaleLowerCase(
    ...input: Parameters<string['toLocaleLowerCase']>
  ): ValidatorProxy<this> {
    return this.transform((str) => str.toLocaleLowerCase(...input));
  }

  public toLocaleUpperCase(
    ...input: Parameters<string['toLocaleUpperCase']>
  ): ValidatorProxy<this> {
    return this.transform((str) => str.toLocaleUpperCase(...input));
  }

  public normalize(
    ...input: Parameters<string['normalize']>
  ): ValidatorProxy<this> {
    return this.transform((str) => str.normalize(...input));
  }

  public trim(): ValidatorProxy<this> {
    return this.transform((str) => str.trim());
  }

  public min(
    length: number,
    error?: ErrorLike<[string]>,
  ): ValidatorProxy<this> {
    return this.test(
      (str) => str.length >= length,
      error ||
        ((str): RangeError =>
          new RangeError(
            `Expect length to be minimum of ${length} characters (actual: ${str.length})`,
          )),
    );
  }

  public max(
    length: number,
    error?: ErrorLike<[string]>,
  ): ValidatorProxy<this> {
    return this.test(
      (str) => str.length <= length,
      error ||
        ((str): RangeError =>
          new RangeError(
            `Expect length to be maximum of ${length} characters (actual: ${str.length})`,
          )),
    );
  }

  public between(
    minLength: number,
    maxLength: number,
    error?: ErrorLike<[string]>,
  ): ValidatorProxy<this> {
    return this.test(
      (str) => str.length >= minLength && str.length <= maxLength,
      error ||
        ((str): RangeError =>
          new RangeError(
            `Expect length to be between ${minLength} and ${maxLength} characters (actual: ${str.length})`,
          )),
    );
  }

  public regexp(
    exp: RegExp | string,
    error?: ErrorLike<[string]>,
  ): ValidatorProxy<this> {
    return this.transform(regexp(exp, error));
  }
}

const string = new StringValidator(type('string')).proxy();

export default string;
