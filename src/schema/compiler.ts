import {
  SchemaParameters,
  SchemaReturnType,
  SchemaValidatorFunction,
} from './io';
import ErrorLike, { toError } from './ErrorLike';

export default function compiler<S>(
  schema: S,
  error?: ErrorLike<SchemaParameters<S>>,
): SchemaValidatorFunction<S> {
  return (...args: SchemaParameters<S>): SchemaReturnType<S> => {
    // TODO compiler

    throw toError(error || 'Not Implemented', ...args);
  };
}
