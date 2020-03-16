import 'mocha';
import { assert } from 'chai';

import {
  Between,
  Equals,
  GreaterThan,
  GreaterThanEqual,
  LessThan,
  LessThanEqual,
} from './comparison';

describe('comparison', () => {
  it('Equals', () => {
    const foo = Equals('foo' as 'foo');

    assert.equal(foo('foo'), 'foo');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => foo('foo1' as any), TypeError);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.throws(() => foo(['foo'] as any), TypeError);

    const objRef = { foo: 1 };
    const obj = Equals(objRef);

    assert.equal(obj(objRef), objRef);
    assert.throws(() => obj({ foo: 1 }), TypeError);
  });

  it('GreaterThan', () => {
    const gt5 = GreaterThan(5, 'my error');

    assert.equal(gt5(6), 6);
    assert.equal(gt5(5.001), 5.001);
    assert.equal(gt5(100), 100);

    assert.throws(() => gt5(5), /^my error$/);
    assert.throws(() => gt5(4), TypeError);
    assert.throws(() => gt5(-5), TypeError);
  });

  it('GreaterThanEqual', () => {
    const gte5 = GreaterThanEqual(5, 'my error');

    assert.equal(gte5(5), 5);
    assert.equal(gte5(6), 6);
    assert.equal(gte5(10.5), 10.5);

    assert.throws(() => gte5(4), /^my error$/);
    assert.throws(() => gte5(-5), TypeError);
  });

  it('LessThan', () => {
    const lt5 = LessThan(5, 'my error');

    assert.equal(lt5(4), 4);
    assert.equal(lt5(4.999), 4.999);
    assert.equal(lt5(0), 0);

    assert.throws(() => lt5(5), /^my error$/);
    assert.throws(() => lt5(10), TypeError);
  });

  it('LessThanEqual', () => {
    const lt5 = LessThanEqual(5, 'my error');

    assert.equal(lt5(5), 5);
    assert.equal(lt5(4), 4);
    assert.equal(lt5(4.999), 4.999);
    assert.equal(lt5(0), 0);

    assert.throws(() => lt5(6), /^my error$/);
    assert.throws(() => lt5(10), TypeError);
  });

  it('Between', () => {
    const both = Between(1, 5, 'my error');

    assert.equal(both(5), 5);
    assert.equal(both(2.5), 2.5);
    assert.equal(both(1), 1);

    assert.throws(() => both(0), /^my error$/);
    assert.throws(() => both(6), TypeError);

    const gte = Between(1, null, 'my error');

    assert.equal(gte(8), 8);
    assert.equal(gte(2.5), 2.5);
    assert.equal(gte(1), 1);

    assert.throws(() => gte(0), /^my error$/);
    assert.throws(() => gte(0.99), TypeError);

    const lte = Between(null, 5, 'my error');

    assert.equal(lte(5), 5);
    assert.equal(lte(2.5), 2.5);
    assert.equal(lte(1), 1);
    assert.equal(lte(-100), -100);

    assert.throws(() => lte(6), /^my error$/);
    assert.throws(() => lte(5.01), TypeError);
  });
});
