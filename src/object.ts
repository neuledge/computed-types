import Validator, { Input } from './Validator';

export class ObjectValidator<I extends Input = [object]> extends Validator<
  object,
  I
> {}

const object = ObjectValidator.proxy<object, [object], ObjectValidator>(
  (input: object): object => {
    if (typeof input !== 'object' || input === null) {
      throw new TypeError(`Expect value to be object`);
    }

    return input;
  },
);

export default object;
