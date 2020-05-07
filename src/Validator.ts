import ErrorLike, { toError } from './ErrorLike';

export type Input = unknown[];

export type FunctionValidator<O, I extends Input = [O]> = (...input: I) => O;

export type ValidatorProxy<
  O,
  I extends Input,
  V = Validator<O, I>
> = FunctionValidator<O, I> & Pick<V, keyof V>;

export interface ValidatorConstructor<
  O,
  I extends Input = [O],
  T extends Validator<O, I> = Validator<O, I>
> {
  new (validator: FunctionValidator<O, I>): T;

  proxy(
    this: ValidatorConstructor<O, I, T>,
    validator: FunctionValidator<O, I>,
  ): FunctionValidator<O, I> & T;
}

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

export default class Validator<O, I extends Input> {
  public readonly validator: FunctionValidator<O, I>;

  public static proxy<O, I extends Input, T extends Validator<O, I>>(
    this: { new (validator: FunctionValidator<O, I>): T },
    validator: FunctionValidator<O, I>,
  ): FunctionValidator<O, I> & T {
    return new this(validator).proxy();
  }

  public constructor(validator: FunctionValidator<O, I>) {
    this.validator = validator;
  }

  public object(
    error?: ErrorLike<[O]>,
  ): ValidatorProxy<object, I, ObjectValidator<I>> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return this.convert<object, ObjectValidator<I>, typeof ObjectValidator>(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      ObjectValidator,
      (input): object => {
        if (typeof input !== 'object') {
          throw toError(error || `Expect value to be object`, input);
        }

        return (input as unknown) as object;
      },
    );
  }

  public string(
    error?: ErrorLike<[O]>,
  ): ValidatorProxy<string, I, StringValidator<I>> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return this.convert<string, StringValidator<I>, typeof StringValidator>(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      StringValidator,
      (input): string => {
        if (typeof input === 'string') {
          return input;
        }

        if (
          input == null ||
          (typeof input === 'object' &&
            ((input as unknown) as object).toString ===
              Object.prototype.toString)
        ) {
          throw toError(error || `Expect value to be string`, input);
        }

        return String(input);
      },
    );
  }

  public number(
    error?: ErrorLike<[O]>,
  ): ValidatorProxy<number, I, NumberValidator<I>> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return this.convert<number, NumberValidator<I>, typeof NumberValidator>(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      NumberValidator,
      (input): number => {
        if (typeof input === 'number') {
          return input;
        }

        const value = Number(input);

        if (isNaN(value) && (input as unknown) !== 'NaN') {
          throw toError(error || `Unknown number value`, input);
        }

        return value;
      },
    );
  }

  public boolean(
    error?: ErrorLike<[O]>,
  ): ValidatorProxy<boolean, I, BooleanValidator<I>> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return this.convert<boolean, BooleanValidator<I>, typeof BooleanValidator>(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      BooleanValidator,
      (input): boolean => {
        if (typeof input === 'boolean') {
          return input;
        }

        const key = String(input).trim().toLowerCase();
        const value = BOOL_MAP[key as keyof typeof BOOL_MAP];

        if (value == null) {
          throw toError(error || `Unknown boolean value`, input);
        }

        return value;
      },
    );
  }

  public equals<T extends O>(
    value: T,
    error?: ErrorLike<[O]>,
  ): ValidatorProxy<T, I, this> {
    return this.test(
      (input: O): boolean => input === value,
      error || `Expected value to equal "${value}"`,
    ) as FunctionValidator<T, I> & Pick<this, keyof this>;
  }

  public test(
    fn: FunctionValidator<unknown, [O]>,
    error?: ErrorLike<[O]>,
  ): ValidatorProxy<O, I, this> {
    return this.transform(
      (input: O): O => {
        if (!fn(input)) {
          throw toError(error || `Validation check failed`, input);
        }

        return input;
      },
    );
  }

  public transform<T, V = Validator<T, I>>(
    fn: FunctionValidator<T, [O]>,
  ): ValidatorProxy<T, I, V> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Class = (this as any).constructor;
    const { validator } = this;

    return new Class((...input: I): T => fn(validator(...input))).proxy();
  }

  protected convert<
    T,
    V extends Validator<T, I>,
    C extends ValidatorConstructor<T, I, V>
  >(constructor: C, fn: (input: O) => T): ValidatorProxy<T, I, V> {
    const { validator } = this;

    return constructor.proxy((...input: I): T => fn(validator(...input)));
  }

  public construct<I0 extends Input>(
    fn: FunctionValidator<I, I0>,
  ): ValidatorProxy<O, I0, this> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Class = (this as any).constructor;
    const { validator } = this;

    return new Class((...input: I0): O => validator(...fn(...input))).proxy();
  }

  public message(error: ErrorLike<I>): ValidatorProxy<O, I, this> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Class = (this as any).constructor;
    const { validator } = this;

    return new Class(
      (...input: I): O => {
        try {
          return validator(...input);
        } catch (e) {
          throw toError(error, ...input);
        }
      },
    ).proxy();
  }

  protected proxy(): ValidatorProxy<O, I, this> {
    return new Proxy(this.validator, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get: (target, propertyKey): any =>
        propertyKey in this
          ? this[propertyKey as keyof Validator<O, I>]
          : this.validator[propertyKey as keyof FunctionValidator<O, I>],
    }) as FunctionValidator<O, I> & this;
  }
}

// circular dependencies: import those after creating the validator class
import { ObjectValidator } from './object';
import { StringValidator } from './string';
import { NumberValidator } from './number';
import { BooleanValidator } from './boolean';
