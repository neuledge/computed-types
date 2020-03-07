import { AnyType, FunctionType, isPromiseLike } from './utils';
import { Equals } from './validators/comparison';
import ValidationError, {
  createError,
  createValidationPathsFromError,
  ErrorPath,
} from './Error';
import { Output, Input } from './Type';

export type SyncFunctionValidator<T = AnyType> = FunctionType<T>;
export type AsyncFunctionValidator<T = AnyType> = FunctionType<PromiseLike<T>>;
export type FunctionValidator<T = AnyType> = FunctionType<PromiseLike<T> | T>;

export type Schema<T = AnyType> = T extends FunctionType
  ? FunctionValidator<T>
  : T extends object
  ? { [K in keyof T]: Schema<T[K]> }
  : FunctionValidator<T> | T;

export type SyncSchema<T> = T extends FunctionType
  ? SyncFunctionValidator<T>
  : T extends object
  ? { [K in keyof T]: SyncSchema<T[K]> }
  : SyncFunctionValidator<T> | T;

export type ValidatorOutput<T> = T extends SyncSchema<Output<T>>
  ? Output<T>
  : PromiseLike<Output<T>>;

export type SchemaValidator<
  T,
  I extends Array<AnyType> = [Input<T>]
> = FunctionType<ValidatorOutput<T>, I>;

// exported functions

export default function Validate<T extends Schema>(
  schema: T,
  errorMsg?: string,
): SchemaValidator<T> {
  switch (typeof schema) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
    case 'symbol':
    case 'bigint':
      return Equals(schema, errorMsg) as SchemaValidator<T>;

    case 'function':
      // TODO fix "as unknown" assumption
      return (schema as unknown) as SchemaValidator<T>;

    case 'object':
      if (schema === null) {
        return Equals(schema, errorMsg) as SchemaValidator<T>;
      }

      return (input: Input<T>): ValidatorOutput<T> => {
        if (typeof input !== 'object') {
          throw new TypeError(
            errorMsg || `Expecting value to be an object: ${typeof input}`,
          );
        }

        if (input === null) {
          throw new TypeError(errorMsg || `Expecting value to be non-nullable`);
        }

        if (Array.isArray(schema) && !Array.isArray(input)) {
          throw new TypeError(errorMsg || `Expecting value to an array`);
        }

        const res: {
          [K in keyof Output<T>]?: PromiseLike<Output<T>[K]> | Output<T>[K];
        } = Array.isArray(schema) ? ([] as {}) : {};

        const promises: PromiseLike<void>[] = [];
        const errorPaths: ErrorPath[] = [];

        for (const key in schema) {
          if (!Object.prototype.hasOwnProperty.call(schema, key)) continue;

          const schemaProp = schema[key];
          const inputProp = input[key];

          try {
            const value = Validate<T[keyof T]>(schemaProp)(inputProp) as
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
                  (err: Partial<ValidationError>) => {
                    errorPaths.push(
                      ...createValidationPathsFromError(key, err),
                    );
                  },
                ),
              );
            }
          } catch (e) {
            errorPaths.push(...createValidationPathsFromError(key, e));
          }
        }

        if (!promises.length) {
          if (errorPaths.length) {
            throw createError(errorPaths, errorMsg);
          }

          return res as T extends SyncSchema<Output<T>>
            ? Output<T>
            : Promise<Output<T>>;
        }

        return Promise.all(promises).then(() => {
          if (errorPaths.length) {
            throw createError(errorPaths, errorMsg);
          }

          return res as Output<T>;
        }) as T extends SyncSchema<Output<T>> ? Output<T> : Promise<Output<T>>;

        // TODO fix "as unknown" assumption
      };

    default:
      throw new Error(`Unknown JavaScript type: ${typeof schema}`);
  }
}
