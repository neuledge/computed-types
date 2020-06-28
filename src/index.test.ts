import 'mocha';
import { assert } from 'chai';
import Schema, { string, array } from './';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('index', () => {
  it('Circular Types', () => {
    // testing issue:
    // https://github.com/neuledge/computed-types/issues/39

    type Node = {
      name: string;
      nodes: Node[];
    };

    const NodeSchema = (node: Node): Node => {
      return Schema({
        name: string.trim().normalize(),
        nodes: array.of(NodeSchema),
      })(node);
    };

    assert.deepEqual(NodeSchema({ name: 'root', nodes: [] }), {
      name: 'root',
      nodes: [],
    });

    assert.deepEqual(
      NodeSchema({ name: 'root', nodes: [{ name: 'foo', nodes: [] }] }),
      {
        name: 'root',
        nodes: [{ name: 'foo', nodes: [] }],
      },
    );

    assert.throws(
      () => NodeSchema({ name: 'root' } as any),
      'nodes: Expecting value to be an array',
    );
  });
});
