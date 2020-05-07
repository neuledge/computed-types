import Validator, { Input } from './Validator';

class UnknownValidator<I extends Input = [unknown]> extends Validator<
  unknown,
  I
> {}

const unknown = UnknownValidator.proxy<unknown, [unknown], UnknownValidator>(
  (input: unknown): unknown => input,
);

export default unknown;
