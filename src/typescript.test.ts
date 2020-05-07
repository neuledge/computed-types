import Validator from './Validator';

type AssertEqual<T, R> = [R] extends [T] ? ([T] extends [R] ? 'ok' : T) : T;

/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any */

describe('TypeScript', () => {
  it('interfaces', () => {
    const plainNumber = Validator.proxy((input: number): number => input);
    const num = plainNumber(5);
    const num5 = plainNumber.equals(5)(5 as 2);

    const test001: AssertEqual<typeof num, number> = 'ok';
    const test002: AssertEqual<typeof num5, 5> = 'ok';
  });
});
