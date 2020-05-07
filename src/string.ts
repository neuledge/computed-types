import ErrorLike from './ErrorLike';
import Validator, { Input, ValidatorProxy } from './Validator';

export class StringValidator<I extends Input = [string]> extends Validator<
  string,
  I
> {
  public toLowerCase(): ValidatorProxy<string, I, this> {
    return this.transform((str) => str.toLowerCase());
  }

  public toUpperCase(): ValidatorProxy<string, I, this> {
    return this.transform((str) => str.toUpperCase());
  }

  public toLocaleLowerCase(
    ...input: Parameters<string['toLocaleLowerCase']>
  ): ValidatorProxy<string, I, this> {
    return this.transform((str) => str.toLocaleLowerCase(...input));
  }

  public toLocaleUpperCase(
    ...input: Parameters<string['toLocaleUpperCase']>
  ): ValidatorProxy<string, I, this> {
    return this.transform((str) => str.toLocaleUpperCase(...input));
  }

  public normalize(
    ...input: Parameters<string['normalize']>
  ): ValidatorProxy<string, I, this> {
    return this.transform((str) => str.normalize(...input));
  }

  public trim(): ValidatorProxy<string, I, this> {
    return this.transform((str) => str.trim());
  }

  public min(
    length: number,
    error?: ErrorLike<[string]>,
  ): ValidatorProxy<string, I, this> {
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
  ): ValidatorProxy<string, I, this> {
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
  ): ValidatorProxy<string, I, this> {
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
  ): ValidatorProxy<string, I, this> {
    return this.test(
      (str) => str.match(regexp) != null,
      error || `Invalid string format (expected: ${regexp})`,
    );
  }
}

const string = StringValidator.proxy<string, [string], StringValidator>(
  (input: string): string => {
    if (typeof input !== 'string') {
      throw TypeError(`Expect value to be string`);
    }

    return input;
  },
);

export default string;
