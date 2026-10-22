import { ErrorLike } from './schema/errors';
import Validator, { ValidatorProxy } from './Validator';
import FunctionType, { FunctionParameters } from './schema/FunctionType';
import { regexp, type } from './schema/validations';

export class StringValidator<
  P extends FunctionParameters = [string],
> extends Validator<FunctionType<string, P>> {
  public toLowerCase<This extends { validator: FunctionType }>(
    this: This,
  ): ValidatorProxy<This> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).transform((str: string) =>
      str.toLowerCase(),
    ) as ValidatorProxy<This>;
  }

  public toUpperCase<This extends { validator: FunctionType }>(
    this: This,
  ): ValidatorProxy<This> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).transform((str: string) =>
      str.toUpperCase(),
    ) as ValidatorProxy<This>;
  }

  public toLocaleLowerCase<This extends { validator: FunctionType }>(
    this: This,
    ...input: Parameters<string['toLocaleLowerCase']>
  ): ValidatorProxy<This> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).transform((str: string) =>
      str.toLocaleLowerCase(...input),
    ) as ValidatorProxy<This>;
  }

  public toLocaleUpperCase<This extends { validator: FunctionType }>(
    this: This,
    ...input: Parameters<string['toLocaleUpperCase']>
  ): ValidatorProxy<This> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).transform((str: string) =>
      str.toLocaleUpperCase(...input),
    ) as ValidatorProxy<This>;
  }

  public normalize<This extends { validator: FunctionType }>(
    this: This,
    ...input: Parameters<string['normalize']>
  ): ValidatorProxy<This> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).transform((str: string) =>
      str.normalize(...input),
    ) as ValidatorProxy<This>;
  }

  public trim<This extends { validator: FunctionType }>(
    this: This,
  ): ValidatorProxy<This> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).transform((str: string) =>
      str.trim(),
    ) as ValidatorProxy<This>;
  }

  public truncate<This extends { validator: FunctionType }>(
    this: This,
    length: number,
  ): ValidatorProxy<This> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).transform((str: string) =>
      str.length > length ? `${str.substring(0, length - 1)}…` : str,
    ) as ValidatorProxy<This>;
  }

  public min<This extends { validator: FunctionType }>(
    this: This,
    length: number,
    error?: ErrorLike<[string]>,
  ): ValidatorProxy<This> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).test(
      (str: string) => str.length >= length,
      error ||
        ((str: string): RangeError =>
          new RangeError(
            `Expect length to be minimum of ${length} characters (actual: ${str.length})`,
          )),
    ) as ValidatorProxy<This>;
  }

  public max<This extends { validator: FunctionType }>(
    this: This,
    length: number,
    error?: ErrorLike<[string]>,
  ): ValidatorProxy<This> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).test(
      (str: string) => str.length <= length,
      error ||
        ((str: string): RangeError =>
          new RangeError(
            `Expect length to be maximum of ${length} characters (actual: ${str.length})`,
          )),
    ) as ValidatorProxy<This>;
  }

  public between<This extends { validator: FunctionType }>(
    this: This,
    minLength: number,
    maxLength: number,
    error?: ErrorLike<[string]>,
  ): ValidatorProxy<This> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).test(
      (str: string) => str.length >= minLength && str.length <= maxLength,
      error ||
        ((str: string): RangeError =>
          new RangeError(
            `Expect length to be between ${minLength} and ${maxLength} characters (actual: ${str.length})`,
          )),
    ) as ValidatorProxy<This>;
  }

  public regexp<This extends { validator: FunctionType }>(
    this: This,
    exp: RegExp | string,
    error?: ErrorLike<[string]>,
  ): ValidatorProxy<This> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).transform(regexp(exp, error)) as ValidatorProxy<This>;
  }
}

const string = new StringValidator(type('string')).proxy();

export default string;
