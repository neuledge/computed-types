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
      // typeCheck<typeof validator, (x: 'string') => 'foo'>(1);
      // typeCheck<typeof validator, (x: 'foo') => 'string'>(1);

      const ret = validator('string');

      typeCheck<[typeof ret], ['string']>('ok');
      assert.equal(ret, 'string');
    });

    // TODO tests
  });
});
