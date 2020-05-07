import { Input } from './Validator';

type ErrorLike<I extends Input = never> =
  | string
  | Error
  | ((...input: I) => string | Error);

export default ErrorLike;

export function toError<I extends Input = Input>(
  error: ErrorLike<I>,
  ...input: I
): Error {
  if (typeof error === 'string') {
    return new TypeError(error);
  }

  if (typeof error === 'function') {
    return toError(error(...input));
  }

  return error;
}
