import 'mocha';
import { assert, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Schema, { array, string } from './';
import { ValidationError } from './schema/errors';
import Validator, { ValidatorProxy } from './Validator';
import FunctionType from './schema/FunctionType';

use(chaiAsPromised);

type UnknownRecursiveValidator = ValidatorProxy<
  Validator<FunctionType<unknown, [unknown]>>
>;

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Schema.recursive', () => {
  it('validates a recursive Branch/Leaf tree and rejects malformed children', () => {
    const NodeSchema: UnknownRecursiveValidator = Schema.recursive<unknown>(
      (self) => ({
        name: string,
        children: array.of(self),
      }),
    );

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

  it('supports mutually referencing schemas through deferred factories', () => {
    const ASchema: UnknownRecursiveValidator = Schema.recursive<unknown>(() =>
      Schema({ name: string, b: BSchema.optional() }),
    );
    const BSchema: UnknownRecursiveValidator = Schema.recursive<unknown>(() =>
      Schema({ name: string, a: ASchema.optional() }),
    );

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
});
