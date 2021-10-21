import 'mocha';
import { assert } from 'chai';
import unknown from './unknown';
import { typeCheck } from './schema/utils';
import { ValidationError } from './schema/errors';
import string from './string';
import number from './number';

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

    assert.throws(() => unknown.boolean()([]), ValidationError);
    assert.throws(() => unknown.boolean()('hello'), ValidationError);
    assert.throws(() => unknown.boolean()(''), ValidationError);
    assert.throws(() => unknown.boolean()(undefined), ValidationError);
    assert.throws(() => unknown.boolean()(null), ValidationError);
    assert.throws(() => unknown.boolean()({}), ValidationError);
    assert.throws(() => unknown.boolean()({ foo: 1 }), ValidationError);

    assert.throws(
      () => unknown.boolean('undefined')(undefined),
      ValidationError,
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

    assert.throws(() => unknown.string()({}), ValidationError);
    assert.throws(() => unknown.string()(undefined), ValidationError);
    assert.throws(() => unknown.string()(null), ValidationError);
    assert.throws(() => unknown.string()({}), ValidationError);
    assert.throws(() => unknown.string()({ foo: 1 }), ValidationError);

    assert.throws(
      () => unknown.string('undefined')(undefined),
      ValidationError,
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

    assert.throws(() => unknown.number()({}), ValidationError);
    assert.throws(() => unknown.number()(undefined), ValidationError);
    assert.throws(() => unknown.number()([1, 2]), ValidationError);
    assert.throws(() => unknown.number()({ foo: 1 }), ValidationError);

    assert.throws(
      () => unknown.number('undefined')(undefined),
      ValidationError,
      'undefined',
    );
  });

  it('.array().of()', () => {
    const fooArr = unknown.array().of('foo' as const);
    typeCheck<ReturnType<typeof fooArr>, 'foo'[]>('ok');
    typeCheck<Parameters<typeof fooArr>, [unknown]>('ok');

    assert.deepEqual(fooArr(['foo']), ['foo']);
    assert.deepEqual(fooArr([]), []);
    assert.deepEqual(fooArr(['foo', 'foo']), ['foo', 'foo']);

    assert.throws(() => fooArr(['foo', 'bar'] as any), ValidationError);
    assert.throws(() => fooArr(['foo', 1] as any), ValidationError);
  });

  it('.date()', () => {
    assert.deepEqual(unknown.date()(1), new Date(1));
    assert.deepEqual(
      unknown.date()('1970-01-01T00:00:00.050Z'),
      new Date('1970-01-01T00:00:00.050Z'),
    );

    assert.throws(() => unknown.date()({}), ValidationError);
    assert.throws(() => unknown.date()(undefined), ValidationError);
    assert.throws(() => unknown.date()([1, 2]), ValidationError);
    assert.throws(() => unknown.date()({ foo: 1 }), ValidationError);
    assert.throws(() => unknown.date()(NaN), ValidationError);
    assert.throws(() => unknown.date()(''), ValidationError);

    assert.throws(
      () => unknown.date('undefined')(undefined),
      ValidationError,
      'undefined',
    );
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

    assert.throws(() => validator(2), ValidationError);
    assert.throws(() => validator('Foo'), ValidationError);
  });

  it('.record()', () => {
    const validator = unknown.record(string, number);

    typeCheck<ReturnType<typeof validator>, Record<string, number>>('ok');
    typeCheck<Parameters<typeof validator>, [unknown]>('ok');

    assert.deepEqual(validator({ foo: 1 }), { foo: 1 });
    assert.deepEqual(validator({}), {});

    assert.throws(() => validator(2), ValidationError);
    assert.throws(() => validator('Foo'), ValidationError);
    assert.throws(() => validator({ foo: 'foo' }), ValidationError);
  });
});
