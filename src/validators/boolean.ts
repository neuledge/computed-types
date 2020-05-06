import Validator, { Input } from './Validator';

export class BooleanValidator<I extends Input = [boolean]> extends Validator<
  boolean,
  I
> {}

const boolean = BooleanValidator.proxy<boolean, [boolean], BooleanValidator>(
  (input: boolean): boolean => {
    if (typeof input !== 'boolean') {
      throw new TypeError(`Expect value to be boolean`);
    }

    return input;
  },
);

export default boolean;
