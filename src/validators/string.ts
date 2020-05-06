import { ErrorLike, toError } from '../Error';
import Validator, { FunctionValidator, Input } from './Validator';
import boolean from './boolean';

export class StringValidator<I extends Input = [string]> extends Validator<
  string,
  I
> {
  public toLowerCase(): FunctionValidator<string, I> & StringValidator<I> {
    return this.transform((str) => str.toLowerCase());
  }

  public toUpperCase(): FunctionValidator<string, I> & StringValidator<I> {
    return this.transform((str) => str.toUpperCase());
  }

  public toLocaleLowerCase(
    ...input: Parameters<string['toLocaleLowerCase']>
  ): FunctionValidator<string, I> & StringValidator<I> {
    return this.transform((str) => str.toLocaleLowerCase(...input));
  }

  public toLocaleUpperCase(
    ...input: Parameters<string['toLocaleUpperCase']>
  ): FunctionValidator<string, I> & StringValidator<I> {
    return this.transform((str) => str.toLocaleUpperCase(...input));
  }

  public normalize(
    ...input: Parameters<string['normalize']>
  ): FunctionValidator<string, I> & StringValidator<I> {
    return this.transform((str) => str.normalize(...input));
  }

  public trim(): FunctionValidator<string, I> & StringValidator<I> {
    return this.transform((str) => str.trim());
  }

  public min(
    length: number,
    error?: ErrorLike,
  ): FunctionValidator<string, I> & StringValidator<I> {
    return this.transform((str): string => {
      if (str.length < length) {
        throw toError(
          error ||
            `Expect length to be minimum of ${length} characters (actual: ${str.length})`,
        );
      }

      return str;
    });
  }

  public max(
    length: number,
    error?: ErrorLike,
  ): FunctionValidator<string, I> & StringValidator<I> {
    return this.transform((str): string => {
      if (str.length > length) {
        throw toError(
          error ||
            `Expect length to be maximum of ${length} characters (actual: ${str.length})`,
        );
      }

      return str;
    });
  }

  public between(
    minLength: number,
    maxLength: number,
    error?: ErrorLike,
  ): FunctionValidator<string, I> & StringValidator<I> {
    return this.max(minLength, error).max(maxLength, error);
  }

  public regexp(
    regexp: RegExp | string,
    error?: ErrorLike,
  ): FunctionValidator<string, I> & StringValidator<I> {
    return this.transform((str): string => {
      if (str.match(regexp) === null) {
        throw toError(error || `Invalid string format (expected: ${regexp})`);
      }

      return str;
    });
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
