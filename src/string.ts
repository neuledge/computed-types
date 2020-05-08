import ErrorLike from './schema/ErrorLike';
import Validator, { ValidatorProxy } from './Validator';
import FunctionType, { FunctionParameters } from './schema/FunctionType';

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
        ((str): string =>
          `Expect length to be minimum of ${length} characters (actual: ${str.length})`),
    );
  }

  public max(
    length: number,
    error?: ErrorLike<[string]>,
  ): ValidatorProxy<this> {
    return this.test(
      (str) => str.length <= length,
      error ||
        ((str): string =>
          `Expect length to be maximum of ${length} characters (actual: ${str.length})`),
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
        ((str): string =>
          `Expect length to be between ${minLength} and ${maxLength} characters (actual: ${str.length})`),
    );
  }

  public regexp(
    regexp: RegExp | string,
    error?: ErrorLike<[string]>,
  ): ValidatorProxy<this> {
    return this.test(
      (str) => str.match(regexp) != null,
      error || `Invalid string format (expected: ${regexp})`,
    );
  }
}

const string = new StringValidator((input: string): string => {
  if (typeof input !== 'string') {
    throw TypeError(`Expect value to be string`);
  }

  return input;
}).proxy();

export default string;
