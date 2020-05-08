import Validator from './Validator';
import FunctionType, { FunctionParameters } from './schema/FunctionType';

export class BooleanValidator<
  P extends FunctionParameters = [boolean]
> extends Validator<FunctionType<boolean, P>> {}

const boolean = new BooleanValidator((input: boolean): boolean => {
  if (typeof input !== 'boolean') {
    throw new TypeError(`Expect value to be boolean`);
  }

  return input;
}).proxy();

export default boolean;
