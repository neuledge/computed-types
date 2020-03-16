import 'mocha';
import { assert } from 'chai';

import { Bool } from './boolean';

describe('boolean', () => {
  it('Bool', () => {
    assert.equal(Bool(true), true);
    assert.equal(Bool(false), false);
    assert.equal(Bool('true'), true);
    assert.equal(Bool('false'), false);
    assert.equal(Bool('1'), true);
    assert.equal(Bool('0'), false);
    assert.equal(Bool('t'), true);
    assert.equal(Bool('f'), false);
    assert.equal(Bool('T'), true);
    assert.equal(Bool('F'), false);
    assert.equal(Bool('True'), true);
    assert.equal(Bool('False'), false);
    assert.equal(Bool('Yes'), true);
    assert.equal(Bool('No'), false);
    assert.equal(Bool('Y'), true);
    assert.equal(Bool('N'), false);
    assert.equal(Bool(1), true);
    assert.equal(Bool(0), false);
    assert.equal(Bool([1]), true);
    assert.equal(Bool([0]), false);

    assert.throws(() => Bool(0.5), TypeError);
    assert.throws(() => Bool(1.2), TypeError);
    assert.throws(() => Bool('hello'), TypeError);
    assert.throws(() => Bool({}), TypeError);
    assert.throws(() => Bool(['foo']), TypeError);
    assert.throws(() => Bool(null), TypeError);
    assert.throws(() => Bool(undefined), TypeError);
  });
});
