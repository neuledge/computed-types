import Validator, { FunctionValidator, Input } from './Validator';
import { ErrorLike, toError } from '../Error';
import { BooleanValidator } from './boolean';
import { StringValidator } from './string';

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

class UnknownValidator<I extends Input = [unknown]> extends Validator<
  unknown,
  I
> {
  public string(
    error?: ErrorLike,
  ): FunctionValidator<string, I> & StringValidator<I> {
    const { validator } = this;

    return StringValidator.proxy<string, I, StringValidator<I>>(
      (...input: I): string => {
        const output = validator(...input);

        if (typeof output === 'string') {
          return output;
        }

        if (
          output == null ||
          (typeof output === 'object' &&
            (output as object).toString === Object.prototype.toString)
        ) {
          throw toError(error || `Expect value to be string`);
        }

        return String(output);
      },
    );
  }

  public boolean(
    error?: ErrorLike,
  ): FunctionValidator<boolean, I> & BooleanValidator<I> {
    const { validator } = this;

    return BooleanValidator.proxy<boolean, I, BooleanValidator<I>>(
      (...input: I): boolean => {
        const output = validator(...input);

        if (typeof output === 'boolean') {
          return output;
        }

        const key = String(output).trim().toLowerCase();
        const value = BOOL_MAP[key as keyof typeof BOOL_MAP];

        if (value == null) {
          throw toError(error || `Unknown boolean value`);
        }

        return value;
      },
    );
  }
}

const unknown = UnknownValidator.proxy<unknown, [unknown], UnknownValidator>(
  (input: unknown): unknown => input,
);

export default unknown;
