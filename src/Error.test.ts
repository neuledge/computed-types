import 'mocha';
import { assert } from 'chai';

import { createValidationError, getErrorPaths, toError } from './Error';

describe('Error', () => {
  it('toError', () => {
    assert.instanceOf(toError('foo'), TypeError);
    assert.instanceOf(toError(new ReferenceError()), ReferenceError);

    assert.equal(toError('foo').message, 'foo');
    assert.equal(toError(new Error('bar')).message, 'bar');
  });

  it('createValidationError', () => {
    assert.throws(() => createValidationError([], 'foo'), /^foo$/);
    assert.throws(
      () => createValidationError([]),
      /^Unknown Validation Error$/,
    );

    const paths = [{ path: ['foo'], error: new Error('test') }];
    const err = createValidationError(paths, 'foo');

    assert.equal(err.message, 'foo');
    assert.equal(err.paths, paths);
  });

  it('getErrorPaths', () => {
    const test = new Error('test');

    assert.deepEqual(getErrorPaths(test, ['foo']), [
      { error: test, path: ['foo'] },
    ]);

    const paths = [{ path: ['foo'], error: test }];
    const err = createValidationError(paths, 'error');

    assert.deepEqual(getErrorPaths(err, ['bar']), [
      { error: test, path: ['bar', 'foo'] },
    ]);
  });
});
