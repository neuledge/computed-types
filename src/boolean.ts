import Validator from './Validator';
import FunctionType, { FunctionParameters } from './schema/FunctionType';
import { type } from './schema/validations';

export class BooleanValidator<
  P extends FunctionParameters = [boolean],
> extends Validator<FunctionType<boolean, P>> {}

const boolean = new BooleanValidator(type('boolean')).proxy();

export default boolean;
