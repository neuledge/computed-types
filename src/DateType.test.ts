import 'mocha';
import { assert } from 'chai';
import DateType from './DateType';
import { ValidationError } from './schema/errors';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('DateType', () => {
  it('DateType()', () => {
    assert.deepEqual(DateType(new Date(10)), new Date(10));

    assert.throws(() => DateType(undefined as any), ValidationError);
    assert.throws(() => DateType(50 as any), ValidationError);
    assert.throws(() => DateType('test' as any), ValidationError);
    assert.throws(() => DateType(null as any), ValidationError);
    assert.throws(() => DateType(true as any), ValidationError);
    assert.throws(() => DateType(false as any), ValidationError);
    assert.throws(() => DateType({} as any), ValidationError);
  });

  it('.toISOString()', () => {
    assert.equal(
      DateType.toISOString()(new Date('1970-01-01T00:00:00.050Z')),
      '1970-01-01T00:00:00.050Z',
    );
  });

  it('.getTime()', () => {
    assert.equal(DateType.getTime()(new Date(50)), 50);
  });

  it('.min()', () => {
    assert.deepEqual(DateType.min(new Date(50))(new Date(50)), new Date(50));
    assert.deepEqual(DateType.min(new Date(50))(new Date(51)), new Date(51));

    assert.throw(() => DateType.min(new Date(50))(new Date(49)), RangeError);
    assert.throw(
      () => DateType.min(new Date(50))(null as any),
      ValidationError,
    );
    assert.throw(
      () => DateType.min(new Date(50), 'test')(new Date(1)),
      ValidationError,
      'test',
    );
  });

  it('.max()', () => {
    assert.deepEqual(DateType.max(new Date(50))(new Date(50)), new Date(50));
    assert.deepEqual(DateType.max(new Date(50))(new Date(49)), new Date(49));

    assert.throw(() => DateType.max(new Date(50))(new Date(51)), RangeError);
    assert.throw(
      () => DateType.max(new Date(50))(null as any),
      ValidationError,
    );
    assert.throw(
      () => DateType.max(new Date(50), 'test')(new Date(51)),
      ValidationError,
      'test',
    );
  });

  it('.gte()', () => {
    assert.deepEqual(DateType.gte(new Date(50))(new Date(50)), new Date(50));
    assert.deepEqual(DateType.gte(new Date(50))(new Date(51)), new Date(51));

    assert.throw(() => DateType.gte(new Date(50))(new Date(49)), RangeError);
  });

  it('.lte()', () => {
    assert.deepEqual(DateType.lte(new Date(50))(new Date(50)), new Date(50));
    assert.deepEqual(DateType.lte(new Date(50))(new Date(49)), new Date(49));

    assert.throw(() => DateType.lte(new Date(50))(new Date(51)), RangeError);
  });

  it('.gt()', () => {
    assert.deepEqual(DateType.gt(new Date(50))(new Date(51)), new Date(51));

    assert.throw(() => DateType.gt(new Date(50))(new Date(50)), RangeError);
    assert.throw(() => DateType.gt(new Date(50))(new Date(49)), RangeError);
    assert.throw(
      () => DateType.gt(new Date(50), 'test')(new Date(50)),
      ValidationError,
      'test',
    );
  });

  it('.lt()', () => {
    assert.deepEqual(DateType.lt(new Date(50))(new Date(49)), new Date(49));

    assert.throw(() => DateType.lt(new Date(50))(new Date(50)), RangeError);
    assert.throw(() => DateType.lt(new Date(50))(new Date(51)), RangeError);
    assert.throw(
      () => DateType.lt(new Date(50), 'test')(new Date(50)),
      ValidationError,
      'test',
    );
  });

  it('.between()', () => {
    assert.deepEqual(
      DateType.between(new Date(50), new Date(52))(new Date(50)),
      new Date(50),
    );
    assert.deepEqual(
      DateType.between(new Date(50), new Date(52))(new Date(51)),
      new Date(51),
    );
    assert.deepEqual(
      DateType.between(new Date(50), new Date(52))(new Date(52)),
      new Date(52),
    );

    assert.throw(
      () => DateType.between(new Date(50), new Date(52))(new Date(49)),
      RangeError,
    );
    assert.throw(
      () => DateType.between(new Date(50), new Date(52))(new Date(53)),
      RangeError,
    );
    assert.throw(
      () => DateType.between(new Date(50), new Date(52), 'test')(new Date(53)),
      ValidationError,
      'test',
    );
  });
});
