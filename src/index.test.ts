import 'mocha';
import { assert } from 'chai';
import Schema, { string, array } from './';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('index', () => {
  describe('Circular Types', () => {
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

    it('should validate correctly', () => {
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

    it('should use it on other schemas', () => {
      const MainSchema = Schema({
        type: string,
        node: NodeSchema,
      });

      assert.deepEqual(
        MainSchema({ type: 'test', node: { name: 'root', nodes: [] } }),
        { type: 'test', node: { name: 'root', nodes: [] } },
      );

      assert.throws(() => MainSchema({ type: 'test', node: null } as any));
    });
  });
});
