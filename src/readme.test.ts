import 'mocha';
import { assert } from 'chai';
import {
  Schema,
  Or,
  NonEmptyString,
  StringRange,
  Type,
  Optional,
  ValidNumber,
} from './';
import compose from 'compose-function';

describe('README.md', () => {
  it('Usage', () => {
    const UserSchema = {
      name: Optional(String),
      username: compose(StringRange(3, 20), NonEmptyString),
      status: Or('active' as 'active', 'suspended' as 'suspended'),
      amount: ValidNumber,
    };

    const validator = Schema(UserSchema);

    let user: Type<typeof UserSchema>;

    try {
      user = validator({
        username: 'john1',
        status: 'unregistered' as 'active' | 'suspended',
        amount: 12.3,
      });
    } catch (err) {
      // console.error(err.message, err.paths);

      assert.equal(
        err.message,
        'Expect value to equals "suspended" (given: "unregistered")',
      );

      assert.deepEqual(err.paths, [
        {
          path: ['status'],
          message: err.message,
        },
      ]);

      return;
    }

    throw user;
  });
});
