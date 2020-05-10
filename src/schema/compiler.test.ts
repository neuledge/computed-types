import 'mocha';
import { assert } from 'chai';
import { typeCheck } from './utils';
import compiler from './compiler';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('schema', () => {
  describe('compiler', () => {
    it('exact string', () => {
      const validator = compiler('string' as 'string');
      typeCheck<typeof validator, (x: 'string') => 'string'>('ok');

      const ret = validator('string');
      typeCheck<[typeof ret], ['string']>('ok');
      assert.equal(ret, 'string');

      assert.throw(() => validator('foo' as 'string'), TypeError);
    });

    it('exact number', () => {
      const validator = compiler(2 as 2);
      typeCheck<typeof validator, (x: 2) => 2>('ok');

      const ret = validator(2);
      typeCheck<typeof ret, 2>('ok');
      assert.equal(ret, 2);

      assert.throw(() => validator(3 as 2), TypeError);
    });

    it('number validator', () => {
      const validator = compiler((x: number) => x + 1);
      typeCheck<typeof validator, (x: number) => number>('ok');

      const ret = validator(2);
      typeCheck<typeof ret, number>('ok');
      assert.equal(ret, 3);

      assert.equal(validator((true as unknown) as number), 2);
    });

    it('optional validator', () => {
      const validator = compiler((x = 0) => x + 1);
      typeCheck<typeof validator, (x?: number) => number>('ok');

      const ret = validator();
      typeCheck<typeof ret, number>('ok');
      assert.equal(ret, 1);
    });

    it('RegExp', () => {
      const validator = compiler(/^Foo/);
      typeCheck<typeof validator, (x: string) => string>('ok');

      assert.equal(validator('Foo'), 'Foo');
      assert.equal(validator('FooBar'), 'FooBar');

      assert.throws(() => validator('foo'), TypeError);
    });

    it('object', () => {
      const validator = compiler({ foo: String, bar: Number });
      typeCheck<
        typeof validator,
        (x: { foo?: any; bar?: any }) => { foo: string; bar: number }
      >('ok');

      assert.deepEqual(validator({ foo: 'foo', bar: 123 }), {
        foo: 'foo',
        bar: 123,
      });

      assert.deepEqual(validator({ foo: null, bar: '123' }), {
        foo: 'null',
        bar: 123,
      });

      assert.throws(() => validator(123 as any), TypeError);
    });

    it('null', () => {
      const validator = compiler(null);
      typeCheck<typeof validator, (x: null) => null>('ok');

      assert.equal(validator(null), null);

      assert.throws(() => validator(12 as any), TypeError);
    });

    it('array', () => {
      const validator = compiler([1, 'foo'] as [1, 'foo']);
      typeCheck<typeof validator, (x: [1, 'foo']) => [1, 'foo']>('ok');

      assert.deepEqual(validator([1, 'foo']), [1, 'foo']);

      assert.throws(() => validator(['foo', 1] as any), TypeError);
      assert.throws(() => validator([1, 'foo', 1] as any), TypeError);
      assert.throws(() => validator([1] as any), TypeError);
      assert.throws(() => validator([2, 'foo'] as any), TypeError);
      assert.throws(() => validator({ foo: 1 } as any), TypeError);
    });

    it('async', async () => {
      const validator = compiler(
        (x: number): PromiseLike<number> =>
          x >= 0 ? Promise.resolve(x + 1) : Promise.reject(x),
      );
      typeCheck<typeof validator, (x: number) => PromiseLike<number>>('ok');
      typeCheck<typeof validator, (x: string) => PromiseLike<number>>(
        validator,
      );

      await assert.isFulfilled(validator(2));
      await assert.isRejected(validator(-1));

      assert.equal(await validator(1), 2);
    });

    // TODO tests
  });
});
