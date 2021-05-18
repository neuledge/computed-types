import Validator from './Validator';
import FunctionType, { FunctionParameters } from './schema/FunctionType';
import { type } from './schema/validations';

export class ObjectValidator<
  // eslint-disable-next-line @typescript-eslint/ban-types
  P extends FunctionParameters = [object],
  // eslint-disable-next-line @typescript-eslint/ban-types
> extends Validator<FunctionType<object, P>> {}

const object = new ObjectValidator(type('object')).proxy();

export default object;
