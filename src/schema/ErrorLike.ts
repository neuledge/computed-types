import { FunctionParameters } from './FunctionType';

type ErrorLike<P extends FunctionParameters = never> =
  | string
  | Error
  | ((...args: P) => string | Error);

export default ErrorLike;

export function toError<P extends FunctionParameters>(
  error: ErrorLike<P>,
  ...args: P
): Error {
  if (typeof error === 'string') {
    return new TypeError(error);
  }

  if (typeof error === 'function') {
    return toError(error(...args));
  }

  return error;
}
