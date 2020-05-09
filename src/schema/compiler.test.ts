import 'mocha';
import { assert } from 'chai';
import { typeCheck } from './utils';
import compiler from './compiler';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('schema', () => {
  describe('compiler', () => {
    it('exact string', () => {
      const validator = compiler('string' as 'string');
      typeCheck<typeof validator, (x: 'string') => 'string'>('ok');

      const ret = validator('string');
      typeCheck<[typeof ret], ['string']>('ok');
      assert.equal(ret, 'string');

      assert.throw(() => validator('foo' as 'string'), TypeError);
    });

    // TODO tests
  });
});
