import FunctionType, { FunctionParameters } from './schema/FunctionType';
import ErrorLike, { toError } from './schema/ErrorLike';

export type ValidatorProxy<
  V extends { validator: FunctionType },
  F extends FunctionType = V['validator']
> = F & Omit<V, 'validator' | 'proxy'> & { validator: F };

export interface ValidatorConstructor<
  V extends Validator<F>,
  F extends FunctionType = V['validator']
> {
  new (validator: F): V;
}

export default class Validator<F extends FunctionType> {
  public readonly validator: F;

  public constructor(validator: F) {
    this.validator = validator;
  }

  public proxy(): ValidatorProxy<this> {
    return new Proxy(this.validator, {
      get: (target, propertyKey): this[keyof this] | F[keyof F] =>
        propertyKey in this
          ? this[propertyKey as keyof this]
          : this.validator[propertyKey as keyof F],
    }) as ValidatorProxy<this>;
  }

  public equals<T extends ReturnType<F>>(
    value: T,
    error?: ErrorLike<[ReturnType<F>]>,
  ): ValidatorProxy<this, FunctionType<T, Parameters<F>>> {
    return this.test(
      (input): boolean => input === value,
      error || `Expect value to equal "${value}"`,
    );
  }

  public test(
    fn: FunctionType<unknown, [ReturnType<F>]>,
    error?: ErrorLike<[ReturnType<F>]>,
  ): ValidatorProxy<this> {
    return this.transform((input) => {
      if (!fn(input)) {
        throw toError(error || `Validation check failed`, input);
      }

      return input;
    });
  }

  // public transform<T>(
  //   fn: FunctionType<T, [ReturnType<F>]>,
  // ): ValidatorProxy<
  //   [T] extends [ReturnType<F>]
  //     ? this
  //     : Validator<FunctionType<T, Parameters<F>>>
  // >;
  public transform<T, V extends Validator<FunctionType<T, Parameters<F>>>>(
    fn: FunctionType<T, [ReturnType<F>]>,
    constructor: ValidatorConstructor<V> = this
      .constructor as ValidatorConstructor<V>,
  ): ValidatorProxy<V> {
    const { validator } = this;

    return new constructor((...args) => fn(validator(...args))).proxy();
  }

  public construct<P0 extends FunctionParameters>(
    fn: FunctionType<Parameters<F>, P0>,
  ): ValidatorProxy<this, FunctionType<ReturnType<F>, P0>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Class = (this as any).constructor;
    const { validator } = this;

    return new Class(
      (...args: P0): ReturnType<F> => validator(...fn(...args)),
    ).proxy();
  }

  public message(error: ErrorLike<Parameters<F>>): ValidatorProxy<this> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Class = (this as any).constructor;
    const { validator } = this;

    return new Class(
      (...args: Parameters<F>): ReturnType<F> => {
        try {
          return validator(...args);
        } catch (e) {
          throw toError(error, ...args);
        }
      },
    ).proxy();
  }
}

// circular dependencies: import those after creating the validator class
// import { ObjectValidator } from './object';
// import { StringValidator } from './string';
// import { NumberValidator } from './number';
// import { BooleanValidator } from './boolean';
