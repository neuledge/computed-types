import Validator from './Validator.ts';
import FunctionType, { FunctionParameters } from './schema/FunctionType.ts';
import { type } from './schema/validations.ts';

export class ObjectValidator<
  // eslint-disable-next-line @typescript-eslint/ban-types
  P extends FunctionParameters = [object]
  // eslint-disable-next-line @typescript-eslint/ban-types
> extends Validator<FunctionType<object, P>> {}

const object = new ObjectValidator(type('object')).proxy();

export default object;
