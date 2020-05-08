import Validator from './Validator';
import FunctionType, { FunctionParameters } from './schema/FunctionType';

export class ObjectValidator<
  P extends FunctionParameters = [object]
> extends Validator<FunctionType<object, P>> {}

const object = new ObjectValidator((input: object): object => {
  if (typeof input !== 'object' || input === null) {
    throw new TypeError(`Expect value to be object`);
  }

  return input;
}).proxy();

export default object;
