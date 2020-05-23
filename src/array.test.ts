import 'mocha';
import { assert, use } from 'chai';
import { typeCheck } from './schema/utils';
import chaiAsPromised from 'chai-as-promised';
import array from './array';

use(chaiAsPromised);

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('array', () => {
  it('array()', () => {
    typeCheck<typeof array, (x: unknown[]) => unknown[]>('ok');

    assert.deepEqual(array([]), []);
    assert.deepEqual(array(['foo']), ['foo']);

    assert.throws(() => array(null as any), TypeError);
    assert.throws(() => array(undefined as any), TypeError);
    assert.throws(() => array({} as any), TypeError);
    assert.throws(() => array({ foo: 1 } as any), TypeError);
    assert.throws(() => array(122 as any), TypeError);
    assert.throws(() => array('ddd' as any), TypeError);
    assert.throws(() => array(true as any), TypeError);
    assert.throws(() => array(false as any), TypeError);
  });

  it('array.min()', () => {
    assert.deepEqual(array.min(3)([1, 2, 3]), [1, 2, 3]);
    assert.deepEqual(array.min(3)([1, 2, 3, 4]), [1, 2, 3, 4]);

    assert.throws(() => array.min(3)([1, 2]), TypeError);
    assert.throws(() => array.min(1, 'test')([]), TypeError, 'test');
  });

  it('array.max()', () => {
    assert.deepEqual(array.max(3)([1, 2, 3]), [1, 2, 3]);
    assert.deepEqual(array.max(3)([1, 2]), [1, 2]);
    assert.deepEqual(array.max(3)([]), []);

    assert.throws(() => array.max(3)([1, 2, 3, 4]), TypeError);
    assert.throws(() => array.max(0, 'test')([1]), TypeError, 'test');
  });

  it('array.between()', () => {
    assert.deepEqual(array.between(1, 3)([1, 2, 3]), [1, 2, 3]);
    assert.deepEqual(array.between(1, 3)([1, 2]), [1, 2]);
    assert.deepEqual(array.between(1, 3)([1]), [1]);

    assert.throws(() => array.between(1, 3)([]), TypeError);
    assert.throws(
      () => array.between(0, 3, 'test')([1, 2, 3, 4]),
      TypeError,
      'test',
    );
  });

  it('array.of()', () => {
    const fooArr = array.of('foo' as const);
    typeCheck<ReturnType<typeof fooArr>, 'foo'[]>('ok');
    typeCheck<Parameters<typeof fooArr>, ['foo'[]]>('ok');

    assert.deepEqual(fooArr(['foo']), ['foo']);
    assert.deepEqual(fooArr([]), []);
    assert.deepEqual(fooArr(['foo', 'foo']), ['foo', 'foo']);

    assert.throws(() => fooArr(['foo', 'bar'] as any), TypeError);
    assert.throws(() => fooArr(['foo', 1] as any), TypeError);
  });

  it('array.of() async', async () => {
    const posArr = array.of(async (x: number) => {
      if (typeof x !== 'number' || x < 0) {
        throw new RangeError(`Negative number`);
      }

      return x;
    });
    typeCheck<ReturnType<typeof posArr>, PromiseLike<number[]>>('ok');
    typeCheck<Parameters<typeof posArr>, [number[]]>('ok');

    assert.deepEqual(await posArr([1]), [1]);
    assert.deepEqual(await posArr([1, 0]), [1, 0]);

    await assert.isRejected(posArr([1, -1] as any), RangeError);
    await assert.isRejected(posArr(['foo', 1] as any), RangeError);
  });
});
