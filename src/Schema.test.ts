import 'mocha';
import { assert } from 'chai';
import Schema from './Schema';

describe('Schema', () => {
  it('String', () => {
    const validator = Schema(String);

    assert.equal(validator('foo'), 'foo');
    assert.equal(validator(123), '123');
    assert.equal(validator(12.3), '12.3');
    assert.equal(validator(0), '0');
    assert.equal(validator(NaN), 'NaN');
    assert.equal(validator(undefined), 'undefined');
    assert.equal(validator(true), 'true');
    assert.equal(validator(null), 'null');
    assert.equal(validator({}), '[object Object]');
  });

  it('Number', () => {
    const validator = Schema(Number);

    assert.equal(validator(123), 123);
    assert.equal(validator(12.3), 12.3);
    assert.equal(validator(-12.3), -12.3);
    assert.equal(validator(0), 0);
    assert.isNaN(validator(NaN));
    assert.isNaN(validator('NaN'));
    assert.equal(validator('123'), 123);
    assert.equal(validator('1.23'), 1.23);
    assert.equal(validator('-1.23'), -1.23);
    assert.isNaN(validator(undefined));
    assert.equal(validator(true), 1);
    assert.equal(validator(false), 0);
    assert.equal(validator(null), 0);
    assert.isNaN(validator({}));
  });

  it('Boolean', () => {
    const validator = Schema(Boolean);

    assert.equal(validator(true), true);
    assert.equal(validator(false), false);
    assert.equal(validator(0), false);
    assert.equal(validator(1), true);
    assert.equal(validator('foo'), true);
    assert.equal(validator('true'), true);
  });

  it('RegExp', () => {
    const validator = Schema(/^Foo/);

    assert.equal(validator('Foo'), 'Foo');
    assert.equal(validator('FooBar'), 'FooBar');

    assert.throws(() => validator('foo'), TypeError);
  });

  it('object', () => {
    const validator = Schema({ foo: String, bar: Number });

    assert.deepEqual(validator({ foo: 'foo', bar: 123 }), {
      foo: 'foo',
      bar: 123,
    });

    assert.deepEqual(validator({ foo: null, bar: '123' }), {
      foo: 'null',
      bar: 123,
    });

    assert.throws(() => validator(123), TypeError);
  });

  it('null', () => {
    const validator = Schema(null);

    assert.equal(validator(null), null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => validator(12 as any), TypeError);
  });

  it('Array', () => {
    const validator = Schema([1 as 1, 'foo' as 'foo']);

    assert.deepEqual(validator([1, 'foo']), [1, 'foo']);

    assert.throws(() => validator([1, 'foo', 1]), TypeError);
    assert.throws(() => validator([1]), TypeError);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => validator([2, 'foo'] as any), TypeError);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => validator({ foo: 1 } as any), TypeError);
  });
});
