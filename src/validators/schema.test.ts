import 'mocha';
import { assert, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

import {
  Any,
  ArrayOf,
  Default,
  Maybe,
  Optional,
  Or,
  Override,
  Required,
  Test,
  Truthy,
  TypeOf,
} from './schema';
import Schema, { Async } from '../Schema';

describe('schema', () => {
  it('Maybe', () => {
    const foo = Maybe('foo' as 'foo');

    assert.equal(foo('foo'), 'foo');
    assert.equal(foo(), undefined);
    assert.equal(foo(undefined), undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => foo(null as any), TypeError);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => foo('foo2' as any), TypeError);
  });

  it('Optional', () => {
    const foo = Optional('foo' as 'foo');

    assert.equal(foo('foo'), 'foo');
    assert.equal(foo(), undefined);
    assert.equal(foo(undefined), undefined);
    assert.equal(foo(null), undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => foo('foo2' as any), TypeError);
  });

  it('Default', () => {
    const foo = Default('foo' as 'foo', 123);

    assert.equal(foo('foo'), 'foo');
    assert.equal(foo(), 123);
    assert.equal(foo(undefined), 123);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => foo(null as any), TypeError);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => foo(123 as any), TypeError);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => foo('foo2' as any), TypeError);
  });

  it('Required', () => {
    const foo = Required('foo' as 'foo');

    assert.equal(foo('foo'), 'foo');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => foo(null as any), TypeError);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => foo(undefined as any), TypeError);

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    assert.throws(() => foo(), TypeError);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => foo('foo2' as any), TypeError);
  });

  it('Truthy', () => {
    assert.equal(Truthy('123'), '123');
    assert.equal(Truthy(1), 1);

    assert.throws(() => Truthy(0), TypeError);
    assert.throws(() => Truthy(false), TypeError);
    assert.throws(() => Truthy(''), TypeError);
    assert.throws(() => Truthy(undefined), TypeError);
    assert.throws(() => Truthy(null), TypeError);
  });

  describe('Or', () => {
    it('foo', () => {
      const foo = Or('foo' as 'foo');

      assert.equal(foo('foo'), 'foo');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assert.throws(() => foo('hello' as any), TypeError);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assert.throws(() => foo(undefined as any), TypeError);
    });

    it('foo | bar', () => {
      const fooBar = Or('foo' as 'foo', 'bar' as 'bar');

      assert.equal(fooBar('foo'), 'foo');
      assert.equal(fooBar('bar'), 'bar');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assert.throws(() => fooBar('hello' as any), TypeError);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assert.throws(() => fooBar(undefined as any), TypeError);
    });

    it('foo | bar | 123', () => {
      const fooBar = Or('foo' as 'foo', 'bar' as 'bar', 123 as 123);

      assert.equal(fooBar('foo'), 'foo');
      assert.equal(fooBar('bar'), 'bar');
      assert.equal(fooBar(123), 123);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assert.throws(() => fooBar('hello' as any), TypeError);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assert.throws(() => fooBar(12 as any), TypeError);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assert.throws(() => fooBar(undefined as any), TypeError);
    });

    it('foo | Async(bar)', async () => {
      const fooBar = Or('foo' as 'foo', Async(Schema('bar' as 'bar')));

      assert.equal(fooBar('foo'), 'foo');
      assert.instanceOf(fooBar('bar'), Promise);
      assert.equal(await fooBar('bar'), 'bar');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await assert.isRejected(fooBar('hello' as any) as PromiseLike<any>);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await assert.isRejected(fooBar(12 as any) as PromiseLike<any>);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await assert.isRejected(fooBar(undefined as any) as PromiseLike<any>);
    });
  });

  it('ArrayOf', () => {
    const foo = ArrayOf('foo' as 'foo');

    assert.deepEqual(foo(['foo']), ['foo']);
    assert.deepEqual(foo(['foo', 'foo']), ['foo', 'foo']);
    assert.deepEqual(foo([]), []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => foo(['bar' as any]), TypeError);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => foo(['foo', 'bar' as any]), TypeError);
  });

  it('TypeOf', () => {
    const str = TypeOf('string');

    assert.equal(str('foo'), 'foo');
    assert.equal(str('bar'), 'bar');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => str(['bar'] as any), TypeError);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => str(123 as any), TypeError);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => str(null as any), TypeError);
  });

  it('Any', () => {
    assert.equal(Any('foo'), 'foo');
    assert.equal(Any('bar'), 'bar');
    assert.equal(Any(123), 123);
    assert.deepEqual(Any([1, 2, 3]), [1, 2, 3]);
    assert.equal(Any(undefined), undefined);
    assert.equal(Any(null), null);

    const objRef = {};
    assert.equal(Any(objRef), objRef);
  });

  it('Override', () => {
    const foo = Override('foo');

    assert.equal(foo('foo'), 'foo');
    assert.equal(foo('bar'), 'foo');
    assert.equal(foo(), 'foo');
    assert.equal(foo(null), 'foo');
    assert.equal(foo(undefined), 'foo');
    assert.equal(foo({}), 'foo');
  });

  it('Test', () => {
    const foo = Test((input: number) => input > 10);

    assert.equal(foo(12), 12);

    assert.throws(() => foo(1), TypeError);
    assert.throws(() => foo(NaN), TypeError);
  });
});
