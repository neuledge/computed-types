<h1 align="center" style="text-align:center">🦩 Funval</h1>

<h4 align="center">A minimalist library for data validation using functions interfaces.</h4>

<p align="center">
  <a href="https://www.npmjs.org/package/funval">
    <img src="http://img.shields.io/npm/v/funval.svg" alt="View On NPM">
  </a>
  <a href="https://travis-ci.org/neuledge/funval">
    <img src="https://travis-ci.org/neuledge/funval.svg?branch=master" alt="Build Status">
  </a>
  <a href="https://libraries.io/npm/funval/">
    <img src="https://img.shields.io/librariesio/release/npm/funval" alt="Dependency Status">
  </a>
  <a href="https://coveralls.io/github/neuledge/funval?branch=master">
    <img src="https://coveralls.io/repos/github/neuledge/funval/badge.svg?branch=master"
      alt="Coverage Status" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/npm/l/funval.svg" alt="License">
  </a>
</p>
<br>

**Funval** is a minimalist validation library that seamlessly integrates with your business logic.
Using only plain functions, *Funval* knows how to validate your data and automatically generates
TypeScript interfaces to reduce code duplications and complexity.

```ts
function ValidNumber(input: unknown): number {
  const value = Number(input);

  if (isNaN(value)) {
    throw new TypeError('Invalid number');
  }
  
  return value;
}
```

### Main Features

- **Easy to Read** - Uses functions as types (including `String`, `Number`, `Boolean`, etc...)
- **Reusable Interfaces** - Create new validator using plain functions in seconds.
- **TypeScript Validation** - Detect errors during compile time.
- **Function Composition** - Pipe multiple validators to generate new ones.
- **Asynchronous & Synchronous Support** - Automatically detected promises.
- **Pure Javascript** - Also works without TypeScript.

<br>

## Install

```bash
npm i funval
```

<br>

## Usage

```ts
import { Schema, Optional, Or, Type, Integer, Between } from 'funval';

const UserSchema = {
  name: Optional(String),
  username: /^[a-z0-9]{3,10}$/,
  status: Or('active' as 'active', 'suspended' as 'suspended'),
  amount: input => Between(1, 50)(Integer(input)),
};

const validator = Schema(UserSchema);

let user: Type<typeof UserSchema>;

try {
  user = validator({
    username: 'john1',
    // @ts-ignore Type '"unregistered"' is not assignable to type '"active" | "suspended"'.
    status: 'unregistered',
    amount: 20,
  });
} catch (err) {
  console.error(err.message, err.paths);
}
```

<br>

## Creating Validators

A validator is any function that can return a value without throwing any exceptions:

```ts
import * as EmailValidator from 'email-validator';

function Email(input: string): string {
  if (!EmailValidator.validate(input)) {
    throw new TypeError(`Invalid email address: "${input}"`);
  }

  return input;
}
```

You can use the above validator on schemas as an `Email` type:

```ts
const UserSchema = {
  email: Email,
};

const validator = Schema(UserSchema);
```

<br>

### Asynchronous Validators

Asynchronous validators are supported by returning a `Promise` (or `PromiseLike`) values:

```ts
import fetch from 'node-fetch';

async function AvailableUsername(input: string): Promise<string> {
  const res = await fetch(`/check-username?username=${encodeURIComponent(input)}`);

  if (!res.ok) {
    throw new TypeError(`Username "${input}" is already taken`);
  }

  return input;
}
```

*Funval* automatically detects promise and convert the return type of the `Validator` to promise as well:
```ts
const UserSchema = {
  username: AvailableUsername,
};
const validator = Schema(UserSchema);

const user = await validator({ username: 'test' });
```

If you prefer, you can safely convert any validator to an asynchronous validator using the `Async`
helper:

```ts
import { Async, Schema } from 'funval';

const UserSchema = {
  email: Email,
};
const validator = Async(Schema(UserSchema));

// will catch instead of throwing
validator({ email: 'invalid-email' }).catch(err => console.err(err));
```

<br>

## Available Validators

All the available validators ordered by type:

* **Schema** -
      [`Schema`](#schema),
      [`Maybe`](#maybe),
      [`Optional`](#optional),
      [`Default`](#default),
      [`Required`](#required),
      [`Truthy`](#truthy),
      [`Or`](#or),
      [`ArrayOf`](#arrayof),
      [`TypeOf`](#typeof),
      [`Any`](#any),
      [`Override`](#override)
      [`Test`](#test)

* **Comparison** -
      [`Equals`](#equals),
      [`GreaterThan`](#greaterthan),
      [`GreaterThanEqual`](#greaterthanequal),
      [`LessThan`](#lessthan),
      [`LessThanEqual`](#lessthanequal),
      [`Between`](#between)

* **Strings** -
      [`ContentString`](#contentstring),
      [`TrimString`](#trimstring)
      [`StringRange`](#stringrange)
      [`StringMatch`](#stringmatch)

* **Numbers** -
      [`Float`](#float),
      [`Integer`](#integer)

* **Booleans** -
      [`Bool`](#bool)

<br>

### `Schema`

```ts
import { Schema } from 'funval';

declare function Schema(schema: any, error?: string | Error): Validator;
```

Validate inputs using the given schema.

**Throws:** If the input does not match the given schema.

<br>

### `Maybe`

```ts
import { Maybe } from 'funval';

declare function Maybe(schema: any, error?: string | Error): Validator;
```

Same as [`Schema`](#schema) but ignores `undefined` or omitted inputs.

**Throws:** If the input tested and does not match the given schema.

<br>

### `Optional`

```ts
import { Optional } from 'funval';

declare function Optional(schema: any, error?: string | Error): Validator;
```

Same as [`Schema`](#schema) but ignores `undefined`, `null` or omitted inputs.

**Throws:** If the input tested and does not match the given schema.

<br>

### `Default`

```ts
import { Default } from 'funval';

declare function Default(schema: any, value: any): Validator;
```

Validate inputs using the given schema or use the given value if input equals to `undefined` or
omitted.

**Throws:** If the input tested and does not match the given schema.

<br>

### `Required`

```ts
import { Required } from 'funval';

declare function Required(schema: any, error?: string | Error): Validator;
```

Validate inputs using the given schema.

**Throws:** If input is `undefined` or does not match the given schema.

<br>

### `Truthy`

```ts
import { Truthy } from 'funval';

declare function Truthy<T>(input: T): T;
```

Validate input is truthy.

**Throws:** If input is not truthy.

<br>

### `Or`

```ts
import { Or } from 'funval';

declare function Or(...candidates: any[]): Validator;
```

Validate inputs using any of the given candidates.

**Throws:** If the input does not match to any of the given schemas.

<br>

### `ArrayOf`

```ts
import { ArrayOf } from 'funval';

declare function ArrayOf(itemSchema: any, error?: string | Error): Validator;
```

Validate the input is an array and that each item matches the given schema.

**Throws:** If the given input is not an array or one of the items not matches the item schema.

<br>

### `TypeOf`

```ts
import { TypeOf } from 'funval';

declare function TypeOf(
  typeOf:
    | 'string'
    | 'number'
    | 'object'
    | 'boolean'
    | 'undefined'
    | 'symbol'
    | 'bigint',
  error?: string | Error,
): Validator;
```

Check the input type is equals to the given type.

**Throws:** If the input type is different from the given type.

<br>

### `Any`

```ts
import { Any } from 'funval';

declare function Any(input: any): any;
```

Allow any type of input.

**Throws:** Never.

<br>

### `Override`

```ts
import { Override } from 'funval';

declare function Override(value: any): Validator;
```

Override any input and returns the given value.

**Throws:** Never.

<br>

### `Test`

```ts
import { Test } from 'funval';

declare function Test<T>(test: (input: T) => unknown, error?: string | Error): Validator;
```

Create a validator from a given test function.

**Throws:** If the test function throws or the test function return a non-truthy value.

<br>

### `Equals`

```ts
import { Equals } from 'funval';

declare function Equals(value: any, error?: string | Error): Validator;
```

Check the input is strictly equals to the given value.

**Throws:** If the input does not equal to the given value.

<br>

### `GreaterThan`

```ts
import { GreaterThan } from 'funval';

declare function GreaterThan(value: any, error?: string | Error): Validator;
```

Check the input is greater than the given value.

**Throws:** If the input does not greater than the given value.

<br>

### `GreaterThanEqual`

```ts
import { GreaterThanEqual } from 'funval';

declare function GreaterThanEqual(value: any, error?: string | Error): Validator;
```

Check the input is greater than or equals the given value.

**Throws:** If the input does not greater than or equals the given value.

<br>

### `LessThan`

```ts
import { LessThan } from 'funval';

declare function LessThan(value: any, error?: string | Error): Validator;
```

Check the input is less than the given value.

**Throws:** If the input does not less than the given value.

<br>

### `LessThanEqual`

```ts
import { LessThanEqual } from 'funval';

declare function LessThanEqual(value: any, error?: string | Error): Validator;
```

Check the input is less than or equals the given value.

**Throws:** If the input does not less than or equals the given value.

<br>

### `Between`

```ts
import { Between } from 'funval';

declare function Between(minValue: any | null, maxValue: any | null, error?: string | Error):
Validator;
```

Check the input is between the given boundaries.

**Throws:** If the input is not between the given boundaries.

<br>

### `ContentString`

```ts
import { ContentString } from 'funval';

declare function ContentString(input: unknown): string;
```

Converts any input to a valid string.

**Throws:** If input is either `null`, `undefined`, an object without proper `toString`
implementation, empty or a whitespace string.

<br>

### `TrimString`

```ts
import { TrimString } from 'funval';

declare function TrimString(input: unknown): string;
```

Same as [`ContentString`](#contentstring), but `trim` the output as well.

**Throws:** If input is either `null`, `undefined`, an object without proper `toString`
implementation, empty or a whitespace string.

<br>

### `StringRange`

```ts
import { StringRange } from 'funval';

declare function StringRange(
  minLength: number | null,
  maxLength: number | null,
  error?: string | Error,
): Validator;
```

Converts any input to a valid string and make sure the string is in the given boundaries.

**Throws:** If input is either `null`, `undefined`, an object without proper `toString`
implementation, empty string, whitespace string, or string outside of the given boundaries.

<br>

### `StringMatch`

```ts
import { StringMatch } from 'funval';

declare function StringMatch(regex: RegEx, error?: string | Error): Validator;
```

Validate the input is matches the given regular expression.

**Throws:** If input does not match the given regular expression.

<br>

### `Float`

```ts
import { Float } from 'funval';

declare function Float(input: unknown): number;
```

Converts any input to a valid float number.

**Throws:** If the input can not convert to a valid number.

<br>

### `Integer`

```ts
import { Integer } from 'funval';

declare function Integer(input: unknown): number;
```

Converts any input to a valid integer number.

**Throws:** If the input can not convert to a valid number or the number is not an integer.

<br>

### `Bool`

```ts
import { Bool } from 'funval';

declare function Bool(input: unknown): boolean;
```

Converts any input to a valid boolean.

**Throws:** If the input can not convert unambiguously to a boolean.


<br>

## License

[MIT](LICENSE) license &copy; 2020 [Neuledge](https://neuledge.com)
