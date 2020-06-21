import 'mocha';
import { assert } from 'chai';
import { typeCheck } from './schema/utils';
import boolean from './boolean';
import { ValidationError } from './schema/errors';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('boolean', () => {
  it('Types', () => {
    typeCheck<ReturnType<typeof boolean>, boolean>('ok');
    typeCheck<Parameters<typeof boolean>, [boolean]>('ok');
  });

  it('()', () => {
    const res = boolean(true);
    typeCheck<typeof res, boolean>('ok');

    assert.equal(boolean(true), true);
    assert.equal(boolean(false), false);

    assert.throws(() => boolean('true' as any), ValidationError);
    assert.throws(() => boolean(0 as any), ValidationError);
    assert.throws(() => boolean(1 as any), ValidationError);
    assert.throws(() => boolean(0.5 as any), ValidationError);
    assert.throws(() => boolean(1.2 as any), ValidationError);
    assert.throws(() => boolean('hello' as any), ValidationError);
    assert.throws(() => boolean({} as any), ValidationError);
    assert.throws(() => boolean(['foo'] as any), ValidationError);
    assert.throws(() => boolean(null as any), ValidationError);
    assert.throws(() => boolean(undefined as any), ValidationError);
  });

  it('.equals()', () => {
    const trueType = boolean.equals(true);
    typeCheck<ReturnType<typeof trueType>, true>('ok');
    typeCheck<Parameters<typeof trueType>, [boolean]>('ok');

    assert.equal(boolean.equals(true)(true), true);
    assert.equal(boolean.equals(false)(false), false);

    assert.throws(() => boolean.equals(true)(false), ValidationError);
    assert.throws(() => boolean.equals(false)(true), ValidationError);
    assert.throws(() => boolean.equals(true)(1 as any), ValidationError);
    assert.throws(() => boolean.equals(false)(0 as any), ValidationError);
  });
});
