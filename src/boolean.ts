import Validator from './Validator.ts';
import FunctionType, { FunctionParameters } from './schema/FunctionType.ts';
import { type } from './schema/validations.ts';

export class BooleanValidator<
  P extends FunctionParameters = [boolean]
> extends Validator<FunctionType<boolean, P>> {}

const boolean = new BooleanValidator(type('boolean')).proxy();

export default boolean;
