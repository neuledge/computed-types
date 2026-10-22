import 'mocha';
import { assert, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Schema, { array, string } from './';
import { ValidationError } from './schema/errors';
import Validator, { ValidatorProxy } from './Validator';
import FunctionType from './schema/FunctionType';
import { typeCheck } from './schema/utils';

use(chaiAsPromised);

type RecursiveValidator<T> = ValidatorProxy<Validator<FunctionType<T, [T]>>>;

type Node = {
  name: string;
  children: Node[];
};

type A = { name: string; b?: B };
type B = { name: string; a?: A };

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Schema.recursive', () => {
  const NodeSchema = Schema.recursive<Node>((self) =>
    Schema({
      name: string,
      children: array.of(self),
    }),
  );

  it('exposes the resolved Node type', () => {
    typeCheck<typeof NodeSchema, (input: Node) => Node>('ok');
  });

  it('validates a recursive Branch/Leaf tree and rejects malformed children', () => {
    assert.deepEqual(NodeSchema({ name: 'root', children: [] }), {
      name: 'root',
      children: [],
    });

    assert.deepEqual(
      NodeSchema({
        name: 'root',
        children: [
          { name: 'branch', children: [{ name: 'leaf', children: [] }] },
        ],
      }),
      {
        name: 'root',
        children: [
          { name: 'branch', children: [{ name: 'leaf', children: [] }] },
        ],
      },
    );

    assert.throws(
      () =>
        NodeSchema({
          name: 'root',
          children: [
            { name: 'branch', children: [{ name: 42, children: [] }] },
          ],
        } as any),
      ValidationError,
      'children.children.name: Expect value to be "string"',
    );
  });

  it('supports optional self-references through self.optional()', () => {
    type LinkedList = { value: string; next?: LinkedList };

    const LinkedListSchema = Schema.recursive<LinkedList>((self) =>
      Schema({
        value: string,
        next: self.optional(),
      }),
    );

    typeCheck<typeof LinkedListSchema, (input: LinkedList) => LinkedList>('ok');

    assert.deepEqual(LinkedListSchema({ value: 'a', next: { value: 'b' } }), {
      value: 'a',
      next: { value: 'b', next: undefined },
    });
    assert.deepEqual(LinkedListSchema({ value: 'a' }), {
      value: 'a',
      next: undefined,
    });
  });

  it('supports mutually referencing schemas through deferred factories', () => {
    const ASchema: RecursiveValidator<A> = Schema.recursive<A>(() =>
      Schema({ name: string, b: BSchema.optional() }),
    );
    const BSchema: RecursiveValidator<B> = Schema.recursive<B>(() =>
      Schema({ name: string, a: ASchema.optional() }),
    );

    typeCheck<typeof ASchema, (input: A) => A>('ok');
    typeCheck<typeof BSchema, (input: B) => B>('ok');

    assert.deepEqual(
      ASchema({ name: 'a', b: { name: 'b', a: { name: 'a2' } } }),
      {
        name: 'a',
        b: { name: 'b', a: { name: 'a2', b: undefined } },
      },
    );

    assert.throws(
      () => ASchema({ name: 'a', b: { name: 'b', a: { name: 42 } } } as any),
      ValidationError,
      'b.a.name: Expect value to be "string"',
    );
  });

  it('rejects a factory whose schema does not resolve to T', () => {
    // @ts-expect-error - a validator for { name: string } cannot claim to validate Node
    const BadSchema = Schema.recursive<Node>(() => Schema({ name: string }));
    void BadSchema;
  });
});
