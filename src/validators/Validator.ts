import { ErrorLike, toError } from '../Error';

export type Input = unknown[];

export type FunctionValidator<O, I extends Input = [O]> = (...input: I) => O;

export type ValidatorProxy<O, I extends Input, S> = FunctionValidator<O, I> &
  Pick<S, keyof S>;

export type TransformValidator<T, O, I extends Input, S> = [T] extends [O]
  ? FunctionValidator<T, I> & Validator<T, I> & S
  : FunctionValidator<T, I> & Validator<T, I>;

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

  public equals<T extends O>(
    value: T,
    error?: ErrorLike,
  ): ValidatorProxy<T, I, this> {
    return this.test(
      (input: O): boolean => input === value,
      error || `Expected value to equal "${value}"`,
    ) as FunctionValidator<T, I> & Pick<this, keyof this>;
  }

  public test(
    fn: FunctionValidator<unknown, [O]>,
    error?: ErrorLike,
  ): ValidatorProxy<O, I, this> {
    return this.transform(
      (input: O): O => {
        if (!fn(input)) {
          throw toError(error || `Validation check failed`);
        }

        return input;
      },
    );
  }

  public transform<T>(
    fn: FunctionValidator<T, [O]>,
  ): TransformValidator<T, O, I, this> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Class = (this as any).constructor;
    const { validator } = this;

    return new Class((...input: I): T => fn(validator(...input))).proxy();
  }

  public construct<I0 extends Input>(
    fn: FunctionValidator<I, I0>,
  ): ValidatorProxy<O, I0, this> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Class = (this as any).constructor;
    const { validator } = this;

    return new Class((...input: I0): O => validator(...fn(...input))).proxy();
  }

  public message(
    error: ErrorLike | ((...input: I) => ErrorLike),
  ): FunctionValidator<O, I> & this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Class = (this as any).constructor;
    const { validator } = this;

    return new Class(
      (...input: I): O => {
        try {
          return validator(...input);
        } catch (e) {
          throw toError(typeof error === 'function' ? error(...input) : error);
        }
      },
    ).proxy();
  }

  protected proxy(): FunctionValidator<O, I> & this {
    return new Proxy(this.validator, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get: (target, propertyKey): any =>
        propertyKey in this
          ? this[propertyKey as keyof Validator<O, I>]
          : this.validator[propertyKey as keyof FunctionValidator<O, I>],
    }) as FunctionValidator<O, I> & this;
  }
}
