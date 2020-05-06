import 'mocha';
import { assert } from 'chai';
import boolean from './boolean';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('boolean', () => {
  it('Bool', () => {
    assert.equal(boolean(true), true);
    assert.equal(boolean(false), false);
    // assert.equal(Bool('true'), true);
    // assert.equal(Bool('false'), false);
    // assert.equal(Bool('1'), true);
    // assert.equal(Bool('0'), false);
    // assert.equal(Bool('t'), true);
    // assert.equal(Bool('f'), false);
    // assert.equal(Bool('T'), true);
    // assert.equal(Bool('F'), false);
    // assert.equal(Bool('True'), true);
    // assert.equal(Bool('False'), false);
    // assert.equal(Bool('Yes'), true);
    // assert.equal(Bool('No'), false);
    // assert.equal(Bool('Y'), true);
    // assert.equal(Bool('N'), false);
    // assert.equal(Bool(1), true);
    // assert.equal(Bool(0), false);
    // assert.equal(Bool([1]), true);
    // assert.equal(Bool([0]), false);

    assert.throws(() => boolean('true' as any), TypeError);
    assert.throws(() => boolean(0 as any), TypeError);
    assert.throws(() => boolean(1 as any), TypeError);
    assert.throws(() => boolean(0.5 as any), TypeError);
    assert.throws(() => boolean(1.2 as any), TypeError);
    assert.throws(() => boolean('hello' as any), TypeError);
    assert.throws(() => boolean({} as any), TypeError);
    assert.throws(() => boolean(['foo'] as any), TypeError);
    assert.throws(() => boolean(null as any), TypeError);
    assert.throws(() => boolean(undefined as any), TypeError);
  });

  it('boolean.equals()', () => {
    assert.equal(boolean.equals(true)(true), true);
    assert.equal(boolean.equals(false)(false), false);

    assert.throws(() => boolean.equals(true)(false), TypeError);
    assert.throws(() => boolean.equals(false)(true), TypeError);
    assert.throws(() => boolean.equals(true)(1 as any), TypeError);
    assert.throws(() => boolean.equals(false)(0 as any), TypeError);
  });
});
