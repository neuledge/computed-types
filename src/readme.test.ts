import 'mocha';
import { assert } from 'chai';
import { Validate, Optional, Or, NonEmptyString, StringRange, Type } from './';
import compose from 'compose-function';

describe('README.md', (): void => {
  it('Usage', (): void => {
    const UserSchema = {
      name: Optional(String),
      username: compose(StringRange(3, 20), NonEmptyString),
      status: Or('active' as 'active', 'suspended' as 'suspended'),
      amount: Number,
    };

    const validator = Validate(UserSchema);

    let user: Type<typeof UserSchema>;

    try {
      user = validator({
        username: 'john1',
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore TS2322: Type '"unregistered"' is not assignable to type '"active" | "suspended"'.
        status: 'unregistered',
        amount: 20.3,
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
