import { AnyType, FunctionType, isPromiseLike } from './utils';
import { Equals } from './validators/comparison';
import ValidationError, {
  createValidationError,
  getErrorPaths,
  ErrorPath,
  toError,
  ErrorLike,
} from './Error';
import { Output, Input } from './Type';
import { StringMatch } from './validators/string';

export type SyncFunctionValidator<
  T = AnyType,
  I extends Array<AnyType> = [Input<T>]
> = FunctionType<T, I>;

export type AsyncFunctionValidator<
  T = AnyType,
  I extends Array<AnyType> = [Input<T>]
> = FunctionType<PromiseLike<T>, I>;

export type FunctionValidator<
  T = AnyType,
  I extends Array<AnyType> = [Input<T>]
> = FunctionType<PromiseLike<T> | T, I>;

export type SchemaType<T = AnyType> = [T] extends [FunctionType]
  ? FunctionValidator<T>
  : [T] extends [object]
  ? { [K in keyof T]: SchemaType<T[K]> }
  : FunctionValidator<T> | T;

export type SyncSchemaType<T> = [T] extends [FunctionType]
  ? SyncFunctionValidator<T>
  : [T] extends [object]
  ? { [K in keyof T]: SyncSchemaType<T[K]> }
  : [T] extends [string]
  ? SyncFunctionValidator<T> | RegExp | T
  : SyncFunctionValidator<T> | T;

export type ValidatorOutput<T> = T extends SyncSchemaType<Output<T>>
  ? Output<T>
  : PromiseLike<Output<T>>;

export type SchemaValidator<
  T,
  I extends Array<AnyType> = [Input<T>]
> = FunctionType<ValidatorOutput<T>, I>;

export type SchemaAsyncValidator<
  T,
  I extends Array<AnyType> = [Input<T>]
> = FunctionType<PromiseLike<Output<T>>, I>;

// exported functions

export default function Schema<T>(
  schema: T,
  error?: ErrorLike,
): SchemaValidator<T> {
  switch (typeof schema) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
    case 'symbol':
    case 'bigint':
      return (Equals(schema, error) as unknown) as SchemaValidator<T>;

    case 'function':
      return (schema as unknown) as SchemaValidator<T>;

    case 'object':
      if (schema === null) {
        return (Equals(schema, error) as unknown) as SchemaValidator<T>;
      }

      if (schema instanceof RegExp) {
        return (StringMatch(schema, error) as unknown) as SchemaValidator<T>;
      }

      return (input: Input<T>): ValidatorOutput<T> => {
        if (typeof input !== 'object') {
          throw toError(
            error || `Expecting value to be an object: ${typeof input}`,
          );
        }

        if (input === null) {
          throw toError(error || `Expecting value to be non-nullable`);
        }

        if (Array.isArray(schema)) {
          if (!Array.isArray(input)) {
            throw toError(error || `Expecting value to an array`);
          }

          if (schema.length !== input.length) {
            throw toError(
              error ||
                `Expecting array length to be ${schema.length} (actual: ${input.length})`,
            );
          }
        }

        const res: {
          [K in keyof Output<T>]?: PromiseLike<Output<T>[K]> | Output<T>[K];
        } = Array.isArray(schema) ? ([] as {}) : {};

        const promises: PromiseLike<void>[] = [];
        const errors: ErrorPath[] = [];

        for (const key in schema) {
          if (!Object.prototype.hasOwnProperty.call(schema, key)) continue;

          const schemaProp = schema[key as keyof T];
          const inputProp = input[key as keyof Input<T>];

          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const value = Schema(schemaProp)(inputProp as any) as
              | PromiseLike<Output<T>[keyof Output<T>]>
              | Output<T>[keyof Output<T>];
            const resKey = key as keyof Output<T>;

            if (!isPromiseLike(value)) {
              res[resKey] = value;
            } else {
              promises.push(
                value.then(
                  value => {
                    res[resKey] = value;
                  },
                  (err: ValidationError) => {
                    errors.push(...getErrorPaths(err, [key]));
                  },
                ),
              );
            }
          } catch (e) {
            errors.push(...getErrorPaths(e, [key]));
          }
        }

        if (!promises.length) {
          if (errors.length) {
            throw createValidationError(errors, error);
          }

          return res as ValidatorOutput<T>;
        }

        return Promise.all(promises).then(() => {
          if (errors.length) {
            throw createValidationError(errors, error);
          }

          return res as Output<T>;
        }) as ValidatorOutput<T>;
      };

    default:
      throw new Error(`Unknown JavaScript type: ${typeof schema}`);
  }
}

export function Async<
  V,
  T extends FunctionValidator<V>,
  I extends Parameters<T>[0]
>(validator: T): FunctionType<PromiseLike<V>, [I]> {
  return (input: I): Promise<V> =>
    new Promise(resolve => resolve(validator(input)));
}
