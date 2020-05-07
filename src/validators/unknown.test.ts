import 'mocha';
import { assert } from 'chai';
import unknown from './unknown';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('unknown', () => {
  it('unknown()', () => {
    assert.equal(unknown(true), true);
    assert.equal(unknown(false), false);
    assert.equal(unknown('string'), 'string');
    assert.equal(unknown(1234), 1234);
    assert.equal(unknown(null), null);
    assert.equal(unknown(undefined), undefined);
    assert.deepEqual(unknown({ foo: 1 }), { foo: 1 });
  });

  it('unknown.boolean()', () => {
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

    assert.throws(() => unknown.boolean('test')(null), TypeError, 'test');
  });

  it('unknown.string()', () => {
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

    assert.throws(() => unknown.string('test')(null), TypeError, 'test');
  });
});
