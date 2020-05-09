import Validator from './Validator';
import FunctionType, { FunctionParameters } from './schema/FunctionType';
import { type } from './schema/validations';

export class ObjectValidator<
  P extends FunctionParameters = [object]
> extends Validator<FunctionType<object, P>> {}

const object = new ObjectValidator(type('object')).proxy();

export default object;
