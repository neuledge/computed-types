import 'mocha';
import { assert, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ValidationError } from './errors';

use(chaiAsPromised);

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('schema', () => {
  describe('errors', () => {
    describe('ValidationError', () => {
      it('should be instance of Error', () => {
        const err = new ValidationError('foo');

        assert.instanceOf(err, Error);
        assert.instanceOf(err, TypeError);
      });

      it('should have error properties', () => {
        const err = new ValidationError('foo');

        assert.deepEqual(Object.getOwnPropertyNames(err).sort(), [
          'errors',
          'message',
          'stack',
        ]);

        assert.equal(String(err), 'ValidationError: foo');
        assert.equal(err.message, 'foo');
        assert.include(err.stack, 'ValidationError: foo');
      });

      it('should have convert to JSON nicely', () => {
        const err = new ValidationError('foo');

        assert.deepEqual(JSON.parse(JSON.stringify(err)), { message: 'foo' });
      });
    });
  });
});
