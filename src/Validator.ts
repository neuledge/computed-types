import FunctionType, { FunctionParameters } from './schema/FunctionType';
import { ErrorLike, ValidationError } from './schema/errors';
import { destruct, equals, error, test } from './schema/validations';
import { isPromiseLike, MaybeAsync, ResolvedValue } from './schema/utils';
import {
  optional as optionalSchema,
  strictOptional as strictOptionalSchema,
} from './schema/logic';
import { MergeSchemaParameters } from './schema/io';

export type ValidatorProxy<
  V extends { validator: FunctionType },
  F extends FunctionType = V['validator'],
> = Omit<V, 'validator' | 'proxy'> & { validator: F } & F;

export interface ValidatorConstructor<
  V extends Validator<F>,
  F extends FunctionType = V['validator'],
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
      get: (
        target: unknown,
        propertyKey: string,
      ): this[keyof this] | F[keyof F] =>
        propertyKey in this
          ? this[propertyKey as keyof this]
          : this.validator[propertyKey as keyof F],
    }) as ValidatorProxy<this>;
  }

  public equals<T extends ResolvedValue<ReturnType<F>>>(
    value: T,
    error?: ErrorLike<[ResolvedValue<ReturnType<F>>]>,
  ): ValidatorProxy<this, FunctionType<T, Parameters<F>>> {
    return this.transform(equals(value, error));
  }

  public test<This extends { validator: FunctionType }>(
    this: This,
    tester: FunctionType<
      unknown,
      [ResolvedValue<ReturnType<This['validator']>>]
    >,
    error?: ErrorLike<[ResolvedValue<ReturnType<This['validator']>>]>,
  ): ValidatorProxy<This> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).transform(test(tester, error)) as ValidatorProxy<This>;
  }

  public transform<
    T,
    V extends Validator<
      FunctionType<MaybeAsync<ReturnType<F>, T>, Parameters<F>>
    >,
  >(
    fn: FunctionType<T, [ResolvedValue<ReturnType<F>>]>,
    constructor: ValidatorConstructor<V> = this
      .constructor as ValidatorConstructor<V>,
  ): ValidatorProxy<V> {
    const { validator } = this;

    return new constructor(((...args): T | PromiseLike<T> => {
      const res = validator(...args);

      if (!isPromiseLike(res)) {
        return fn(res);
      }

      return res.then((ret) =>
        fn(ret as ResolvedValue<ReturnType<F>>),
      ) as PromiseLike<T>;
    }) as FunctionType<MaybeAsync<ReturnType<F>, T>, Parameters<F>>).proxy();
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

  public optional<
    This extends { validator: FunctionType },
    R extends
      | ResolvedValue<ReturnType<This['validator']>>
      | undefined = undefined,
  >(
    this: This,
    defaultValue?: R,
  ): ValidatorProxy<
    This,
    FunctionType<
      ReturnType<This['validator']> | R,
      MergeSchemaParameters<
        Parameters<This['validator']> | [(undefined | null)?]
      >
    >
  > {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Class = (this as any).constructor;
    const { validator } = this;

    return new Class(
      optionalSchema<This['validator'], R>(validator, defaultValue),
    ).proxy();
  }

  public strictOptional<
    This extends { validator: FunctionType },
    R extends
      | ResolvedValue<ReturnType<This['validator']>>
      | undefined = undefined,
  >(
    this: This,
    defaultValue?: R,
  ): ValidatorProxy<
    This,
    FunctionType<
      ReturnType<This['validator']> | R,
      MergeSchemaParameters<Parameters<This['validator']> | [undefined?]>
    >
  > {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Class = (this as any).constructor;
    const { validator } = this;

    return new Class(
      strictOptionalSchema<This['validator'], R>(validator, defaultValue),
    ).proxy();
  }

  public destruct<This extends { validator: FunctionType }>(
    this: This,
    error?: ErrorLike<Parameters<This['validator']>>,
  ): ValidatorProxy<
    This,
    FunctionType<
      MaybeAsync<
        ReturnType<This['validator']>,
        [ValidationError | null, ResolvedValue<ReturnType<This['validator']>>?]
      >,
      Parameters<This['validator']>
    >
  > {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Class = (this as any).constructor;
    const { validator } = this;

    return new Class(destruct(validator, error)).proxy();
  }

  public error<This extends { validator: FunctionType }>(
    this: This,
    err: ErrorLike<Parameters<This['validator']>>,
  ): ValidatorProxy<This> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Class = (this as any).constructor;
    const { validator } = this;

    return new Class(error(validator, err)).proxy();
  }
}

// circular dependencies: import those after creating the validator class
// import { ObjectValidator } from './object';
// import { StringValidator } from './string';
// import { NumberValidator } from './number';
// import { BooleanValidator } from './boolean';
