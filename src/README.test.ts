import 'mocha';
import { assert } from 'chai';
import { typeCheck } from './schema/utils';
import Schema, {
  Type,
  string,
  number,
  array,
  unknown,
  ValidationError,
} from './';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('README', () => {
  it('Usage', () => {
    const UserSchema = Schema({
      name: string.trim().normalize().between(3, 40).optional(),
      username: /^[a-z0-9]{3,10}$/,
      status: Schema.either('active' as const, 'suspended' as const),
      items: array
        .of({
          id: string,
          amount: number.gte(1).integer(),
        })
        .min(1),
    });
    type User = Type<typeof UserSchema>;

    typeCheck<
      User,
      {
        name: string | undefined;
        username: string;
        status: 'active' | 'suspended';
        items: { id: string; amount: number }[];
      }
    >('ok');

    const validator = UserSchema.destruct();

    const [err, user] = validator({
      username: 'john1',
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore Type '"unregistered"' is not assignable to type '"active" | "suspended"'.
      status: 'unregistered',
      items: [{ id: 'item-1', amount: 20 }],
    });

    assert.notEqual(err, null);
    assert.equal(user, undefined);

    const error = err as Required<ValidationError>;

    assert.equal(error.message, 'status: Expect value to equal "suspended"');
    assert.equal(error.errors.length, 1);
    assert.deepEqual(error.errors[0].path, ['status']);
    assert.equal(
      error.errors[0].error.message,
      'Expect value to equal "suspended"',
    );
  });

  it('Validator chain', () => {
    const validator = unknown.number().gt(0).toFixed(2);

    assert.equal(validator('123.4567'), '123.46');
  });
});
