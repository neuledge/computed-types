import 'mocha';
import { assert, use } from 'chai';
import { findSwitchKey, generateSwitch } from './switch';
import chaiAsPromised from 'chai-as-promised';
import { Primitive } from './utils';

use(chaiAsPromised);

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('schema/switch', () => {
  describe('findSwitchKey', () => {
    it('should not find on once candidate', () => {
      assert.equal(findSwitchKey(null), null);
      assert.equal(findSwitchKey('foo'), null);
      assert.equal(findSwitchKey({ key: 'foo' }), null);
    });

    it('should not find on primitive candidates', () => {
      assert.equal(findSwitchKey({ key: 'foo' }, null), null);
      assert.equal(findSwitchKey({ key: 'foo' }, 'foo'), null);
      assert.equal(findSwitchKey({ key: 'foo' }, undefined), null);
    });

    it('should find primitive switches', () => {
      assert.deepEqual(findSwitchKey({ key: 'foo' }, { key: 'bar' }), [
        'key',
        new Map([
          ['foo', 0],
          ['bar', 1],
        ]),
      ]);

      assert.deepEqual(findSwitchKey({ key: 'foo' }, { key: 1, bar: 3 }), [
        'key',
        new Map<Primitive, number>([
          ['foo', 0],
          [1, 1],
        ]),
      ]);

      assert.deepEqual(findSwitchKey({ key: 'foo' }, { bar: 3 }), [
        'key',
        new Map<Primitive, number>([
          ['foo', 0],
          [undefined, 1],
        ]),
      ]);

      assert.deepEqual(
        findSwitchKey({ key: 'foo', bar: 1 }, { key: 'foo', bar: 2 }),
        [
          'bar',
          new Map<Primitive, number>([
            [1, 0],
            [2, 1],
          ]),
        ],
      );

      assert.deepEqual(findSwitchKey({ key: 'foo', bar: 2 }, { key: 'foo' }), [
        'bar',
        new Map<Primitive, number>([
          [2, 0],
          [undefined, 1],
        ]),
      ]);
    });

    it('should not find on equal switches', () => {
      assert.equal(findSwitchKey({ key: 'foo' }, { key: 'foo' }), null);
    });

    it('should not find on hidden properties', () => {
      assert.equal(findSwitchKey({ key: 'foo' }, { key: 'foo', bar: 1 }), null);
    });
  });

  describe('generateSwitch', () => {
    it('should generate a switch', () => {
      const validator = generateSwitch(
        [
          'key',
          new Map([
            ['foo', 0],
            ['bar', 1],
          ]),
        ],
        [
          (x: unknown): [number, unknown] => [0, x],
          (x: unknown): [number, unknown] => [1, x],
        ],
      );

      assert.deepEqual(validator({ key: 'foo', value: 1 }), [
        0,
        { key: 'foo', value: 1 },
      ]);
      assert.deepEqual(validator({ key: 'bar', value: 1 }), [
        1,
        { key: 'bar', value: 1 },
      ]);
      assert.deepEqual(validator('foo'), [0, 'foo']);
      assert.deepEqual(validator({ key: 'hello' }), [0, { key: 'hello' }]);
    });
  });
});
