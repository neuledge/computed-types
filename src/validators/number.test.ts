import 'mocha';
import { assert } from 'chai';

import { Float, Integer } from './number';

describe('number', () => {
  it('Float', () => {
    assert.equal(Float(123), 123);
    assert.equal(Float(12.3), 12.3);
    assert.equal(Float(-12.3), -12.3);
    assert.equal(Float('12.3'), 12.3);
    assert.equal(Float('-12.3'), -12.3);
    assert.equal(Float(false), 0);
    assert.equal(Float(true), 1);

    assert.throws(() => Float('hello'), TypeError);
    assert.throws(() => Float('2 3'), TypeError);
    assert.throws(() => Float(undefined), TypeError);
    assert.throws(() => Float(null), TypeError);
    assert.throws(() => Float(NaN), TypeError);
  });

  it('Integer', () => {
    assert.equal(Integer(123), 123);
    assert.equal(Integer('12'), 12);
    assert.equal(Integer('-12'), -12);
    assert.equal(Integer(false), 0);
    assert.equal(Integer(true), 1);

    assert.throws(() => Integer('hello'), TypeError);
    assert.throws(() => Integer('2 3'), TypeError);
    assert.throws(() => Integer(undefined), TypeError);
    assert.throws(() => Integer(null), TypeError);
    assert.throws(() => Integer(NaN), TypeError);
    assert.throws(() => Integer(1.23), TypeError);
    assert.throws(() => Integer(-1.23), TypeError);
    assert.throws(() => Integer('12.3'), TypeError);
  });
});
