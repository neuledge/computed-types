import {
  SchemaParameters,
  SchemaResolveType,
  SchemaValidatorFunction,
} from './io.ts';
import { createValidationError, ErrorLike, ObjectPath } from './errors.ts';
import { array, equals, regexp, type } from './validations.ts';
import FunctionType from './FunctionType.ts';
import { isPromiseLike } from './utils.ts';
import { PathError } from './errors.ts';

type SchemaKeyTask<S> = (
  res: Record<string, unknown>,
  errors: PathError[],
  // eslint-disable-next-line @typescript-eslint/ban-types
  obj: object,
) => void | PromiseLike<void>;

export default function compiler<S>(
  schema: S,
  opts?:
    | ErrorLike<SchemaParameters<S>>
    | {
        error?: ErrorLike<SchemaParameters<S>>;
        basePath?: ObjectPath;
      },
): SchemaValidatorFunction<S> {
  let error: ErrorLike<SchemaParameters<S>> | undefined;
  let basePath: ObjectPath = [];

  if (opts) {
    if (typeof opts === 'object' && !(opts instanceof Error)) {
      error = opts.error;
      basePath = opts.basePath || basePath;
    } else {
      error = opts;
    }
  }

  if (typeof schema === 'function') {
    return (schema as unknown) as SchemaValidatorFunction<S>;
  }

  if (typeof schema !== 'object' || schema === null) {
    return equals(schema, error) as SchemaValidatorFunction<S>;
  }

  if (schema instanceof RegExp) {
    return regexp(schema, error) as SchemaValidatorFunction<S>;
  }

  let typeValidator: FunctionType<
    // eslint-disable-next-line @typescript-eslint/ban-types
    [object, Record<string, unknown>],
    SchemaParameters<S>
  >;

  if (Array.isArray(schema)) {
    const validator = array(schema.length, error);

    typeValidator = (
      ...args: SchemaParameters<S>
    ): // eslint-disable-next-line @typescript-eslint/ban-types
    [object, Record<string, unknown>] => {
      return [validator(...args), ([] as unknown) as Record<string, unknown>];
    };
  } else {
    const validator = type('object', error);

    typeValidator = (
      ...args: SchemaParameters<S>
    ): // eslint-disable-next-line @typescript-eslint/ban-types
    [object, Record<string, unknown>] => {
      return [validator(...args), {}];
    };
  }

  const tasks = Object.keys(schema).map(
    (key): SchemaKeyTask<S> => {
      const path = [...basePath, key];
      const validator = compiler<unknown>(schema[key as keyof S], {
        basePath: path,
      });

      return (res, errors, obj): void | PromiseLike<void> => {
        try {
          const value: unknown = validator(
            (obj as { [key: string]: unknown })[key],
          );

          if (!isPromiseLike(value)) {
            res[key] = value;
            return;
          }

          return value.then(
            (value) => {
              res[key] = value;
            },
            (err) => {
              errors.push(err);
            },
          );
        } catch (e) {
          errors.push({
            error: e,
            path,
          });
        }
      };
    },
  );

  const tasksCount = tasks.length;

  return ((
    ...args: SchemaParameters<S>
  ): SchemaResolveType<S> | Promise<SchemaResolveType<S>> => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    let obj: object;
    let res: Record<string, unknown>;
    let mainError: Error | undefined;

    try {
      [obj, res] = typeValidator(...args);
    } catch (e) {
      obj = {};
      res = {};
      mainError = e;
    }

    const promises: PromiseLike<void>[] = [];
    const errors: PathError[] = [];

    for (let i = 0; i < tasksCount; i += 1) {
      const promise = tasks[i](res, errors, obj);
      if (promise) promises.push(promise);
    }

    if (!promises.length) {
      if (errors.length || mainError) {
        throw createValidationError(errors, mainError || error, ...args);
      }

      return res as SchemaResolveType<S>;
    }

    return Promise.all(promises).then(() => {
      if (errors.length || mainError) {
        throw createValidationError(errors, mainError || error, ...args);
      }

      return res;
    }) as SchemaResolveType<S>;
  }) as SchemaValidatorFunction<S>;
}
