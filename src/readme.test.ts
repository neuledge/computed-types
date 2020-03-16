import 'mocha';
import { assert } from 'chai';
import { Schema, Or, Type, Optional, Between, Integer } from './';

describe('README.md', () => {
  it('Usage', () => {
    const UserSchema = {
      name: Optional(String),
      username: /^[a-z0-9]{3,10}$/,
      status: Or('active' as 'active', 'suspended' as 'suspended'),
      amount: (input: unknown): number => Between(1, 50)(Integer(input)),
    };

    const validator = Schema(UserSchema);

    let user: Type<typeof UserSchema>;

    try {
      user = validator({
        username: 'john1',
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore Type '"unregistered"' is not assignable to type '"active" | "suspended"'.
        status: 'unregistered',
        amount: 20,
      });
    } catch (err) {
      // console.error(err.message, err.paths);

      assert.equal(
        err.message,
        'Expect value to equals "suspended" (given: "unregistered")',
      );

      assert.deepEqual(err.paths, [
        {
          error: err,
          path: ['status'],
        },
      ]);

      return;
    }

    throw user;
  });
});
