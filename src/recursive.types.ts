import Schema, { array, string } from './';
import { typeCheck } from './schema/utils';
import Validator, { ValidatorProxy } from './Validator';
import FunctionType from './schema/FunctionType';

type RecursiveValidator<T> = ValidatorProxy<Validator<FunctionType<T, [T]>>>;

type Node = {
  name: string;
  children: Node[];
};

const NodeSchema = Schema.recursive<Node>((self) => ({
  name: string,
  children: array.of(self),
}));

typeCheck<typeof NodeSchema, (input: Node) => Node>('ok');

type A = { name: string; b?: B };
type B = { name: string; a?: A };

const ASchema: RecursiveValidator<A> = Schema.recursive<A>(() =>
  Schema({ name: string, b: BSchema.optional() }),
);
const BSchema: RecursiveValidator<B> = Schema.recursive<B>(() =>
  Schema({ name: string, a: ASchema.optional() }),
);

typeCheck<typeof ASchema, (input: A) => A>('ok');
typeCheck<typeof BSchema, (input: B) => B>('ok');
