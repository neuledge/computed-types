import 'mocha';
import { assert } from 'chai';
import unknown from './unknown';
import { typeCheck } from './schema/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('unknown', () => {
  it('unknown()', () => {
    const s = Symbol('s');
    const obj = { foo: 1 };

    assert.equal(unknown(true), true);
    assert.equal(unknown(false), false);
    assert.equal(unknown('string'), 'string');
    assert.equal(unknown(1234), 1234);
    assert.equal(unknown(s), s);
    assert.equal(unknown(null), null);
    assert.equal(unknown(undefined), undefined);
    assert.equal(unknown(obj), obj);
  });

  it('.boolean()', () => {
    assert.equal(unknown.boolean()('true'), true);
    assert.equal(unknown.boolean()('false'), false);
    assert.equal(unknown.boolean()('1'), true);
    assert.equal(unknown.boolean()('0'), false);
    assert.equal(unknown.boolean()('t'), true);
    assert.equal(unknown.boolean()('f'), false);
    assert.equal(unknown.boolean()('T'), true);
    assert.equal(unknown.boolean()('F'), false);
    assert.equal(unknown.boolean()('True'), true);
    assert.equal(unknown.boolean()('False'), false);
    assert.equal(unknown.boolean()('Yes'), true);
    assert.equal(unknown.boolean()('No'), false);
    assert.equal(unknown.boolean()('Y'), true);
    assert.equal(unknown.boolean()('N'), false);
    assert.equal(unknown.boolean()(1), true);
    assert.equal(unknown.boolean()(0), false);
    assert.equal(unknown.boolean()([1]), true);
    assert.equal(unknown.boolean()([0]), false);

    assert.throws(() => unknown.boolean()([]), TypeError);
    assert.throws(() => unknown.boolean()('hello'), TypeError);
    assert.throws(() => unknown.boolean()(''), TypeError);
    assert.throws(() => unknown.boolean()(undefined), TypeError);
    assert.throws(() => unknown.boolean()(null), TypeError);
    assert.throws(() => unknown.boolean()({}), TypeError);
    assert.throws(() => unknown.boolean()({ foo: 1 }), TypeError);

    assert.throws(
      () => unknown.boolean('undefined')(undefined),
      TypeError,
      'undefined',
    );
  });

  it('.string()', () => {
    assert.equal(unknown.string()('hello'), 'hello');
    assert.equal(unknown.string()(false), 'false');
    assert.equal(unknown.string()(true), 'true');
    assert.equal(unknown.string()(1), '1');
    assert.equal(unknown.string()(0), '0');
    assert.equal(unknown.string()(-0.65), '-0.65');
    assert.equal(unknown.string()(['hi']), 'hi');
    assert.equal(unknown.string()(['hi', 'me']), 'hi,me');
    assert.equal(unknown.string()([]), '');
    assert.equal(
      unknown.string()({
        toString() {
          return 'foo';
        },
      }),
      'foo',
    );
    assert.equal(unknown.string().toLowerCase().trim()('Hello! '), 'hello!');

    assert.throws(() => unknown.string()({}), TypeError);
    assert.throws(() => unknown.string()(undefined), TypeError);
    assert.throws(() => unknown.string()(null), TypeError);
    assert.throws(() => unknown.string()({}), TypeError);
    assert.throws(() => unknown.string()({ foo: 1 }), TypeError);

    assert.throws(
      () => unknown.string('undefined')(undefined),
      TypeError,
      'undefined',
    );
  });

  it('.number()', () => {
    assert.equal(unknown.number()(1), 1);
    assert.equal(unknown.number()(1.1), 1.1);
    assert.equal(unknown.number()('1.1'), 1.1);
    assert.equal(unknown.number()('-10.1'), -10.1);
    assert.isNaN(unknown.number()('NaN'));
    assert.equal(unknown.number()([1]), 1);
    assert.equal(unknown.number()([-1.44]), -1.44);
    assert.equal(unknown.number()(true), 1);
    assert.equal(unknown.number()(false), 0);
    assert.equal(unknown.number()(null), 0);
    assert.equal(unknown.number()([]), 0);
    assert.equal(unknown.number()(''), 0);

    assert.throws(() => unknown.number()({}), TypeError);
    assert.throws(() => unknown.number()(undefined), TypeError);
    assert.throws(() => unknown.number()([1, 2]), TypeError);
    assert.throws(() => unknown.number()({ foo: 1 }), TypeError);

    assert.throws(
      () => unknown.number('undefined')(undefined),
      TypeError,
      'undefined',
    );
  });

  it('.array().of()', () => {
    const fooArr = unknown.array().of('foo' as 'foo');
    typeCheck<ReturnType<typeof fooArr>, 'foo'[]>('ok');
    typeCheck<Parameters<typeof fooArr>, [unknown]>('ok');

    assert.deepEqual(fooArr(['foo']), ['foo']);
    assert.deepEqual(fooArr([]), []);
    assert.deepEqual(fooArr(['foo', 'foo']), ['foo', 'foo']);

    assert.throws(() => fooArr(['foo', 'bar'] as any), TypeError);
    assert.throws(() => fooArr(['foo', 1] as any), TypeError);
  });

  it('.enum()', () => {
    enum Mixed {
      Foo = 'foo',
      Bar = 1,
    }

    const validator = unknown.enum(Mixed);
    typeCheck<ReturnType<typeof validator>, Mixed>('ok');
    typeCheck<Parameters<typeof validator>, [unknown]>('ok');

    assert.equal(validator('foo'), Mixed.Foo);
    assert.equal(validator(1), Mixed.Bar);

    assert.throws(() => validator(2), TypeError);
    assert.throws(() => validator('Foo'), TypeError);
  });
});
