import Validator, {
  FunctionValidator,
  Input,
  ValidatorConstructor,
} from './Validator';
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
    return this.convert<string, StringValidator<I>, typeof StringValidator>(
      StringValidator,
      (input): string => {
        if (typeof input === 'string') {
          return input;
        }

        if (
          input == null ||
          (typeof input === 'object' &&
            (input as object).toString === Object.prototype.toString)
        ) {
          throw toError(error || `Expect value to be string`);
        }

        return String(input);
      },
    );
  }

  public boolean(
    error?: ErrorLike,
  ): FunctionValidator<boolean, I> & BooleanValidator<I> {
    return this.convert<boolean, BooleanValidator<I>, typeof BooleanValidator>(
      BooleanValidator,
      (input): boolean => {
        if (typeof input === 'boolean') {
          return input;
        }

        const key = String(input).trim().toLowerCase();
        const value = BOOL_MAP[key as keyof typeof BOOL_MAP];

        if (value == null) {
          throw toError(error || `Unknown boolean value`);
        }

        return value;
      },
    );
  }

  private convert<
    T,
    V extends Validator<T, I>,
    C extends ValidatorConstructor<T, I, V>
  >(constructor: C, fn: (input: unknown) => T): FunctionValidator<T, I> & V {
    const { validator } = this;

    return constructor.proxy((...input: I): T => fn(validator(...input)));
  }
}

const unknown = UnknownValidator.proxy<unknown, [unknown], UnknownValidator>(
  (input: unknown): unknown => input,
);

export default unknown;
