<h1 align="center" style="text-align:center">🦩 Computed Types</h1>

<h4 align="center">Runtime validation types for TypeScript.</h4>

<p align="center">
  <a href="https://www.npmjs.org/package/computed-types">
    <img src="http://img.shields.io/npm/v/computed-types.svg" alt="View On NPM">
  </a>
  <a href="https://travis-ci.org/neuledge/computed-types">
    <img src="https://travis-ci.org/neuledge/computed-types.svg?branch=master" alt="Build Status">
  </a>
  <a href="https://libraries.io/npm/computed-types/">
    <img src="https://img.shields.io/librariesio/release/npm/computed-types" alt="Dependency Status">
  </a>
  <a href="https://coveralls.io/github/neuledge/computed-types?branch=master">
    <img src="https://coveralls.io/repos/github/neuledge/computed-types/badge.svg?branch=master"
      alt="Coverage Status" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/npm/l/computed-types.svg" alt="License">
  </a>
</p>
<br>

**Computed-Types**  (formerly: [Funval](https://www.npmjs.org/package/funval)) is a strongly-typed
validation library that seamlessly validates runtime types with perfect synchronization to
TypeScript types. Using only plain functions, *computed-types* knows how to validate your data and
automatically generates TypeScript interfaces to reduce code duplications and complexity.

### Main Features

- **Easy to Read** - Uses runtime types like TypeScript (including `string`, `number`, `boolean`,
 etc...)
- **Reusable Interfaces** - Create new validator using plain functions in seconds.
- **TypeScript Validation** - Detect errors during compile time.
- **Function Composition** - Pipe multiple validators to generate new ones.
- **Asynchronous & Synchronous Support** - Automatically detected promises.
- **Pure Javascript** - Also works without TypeScript.


<br>

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Creating new Types](#creating-new-types)
- [Available Types](#available-types)
- [License](#license)

<br>

## Install

```bash
npm i computed-types
```

<br>

## Usage

```ts
import Schema, { Type, string, number, array } from 'computed-types';

const UserSchema = {
 name: string.trim().normalize().between(3, 40).optional(),
 username: /^[a-z0-9]{3,10}$/,
 status: Schema.either('active' as 'active', 'suspended' as 'suspended'),
 items: array
   .of({
     id: string,
     amount: number.gte(1).integer(),
   })
   .min(1),
};
type User = Type<typeof UserSchema>;

const validator = Schema(UserSchema).destruct();

const [err, user] = validator({
  username: 'john1',
  // @ts-ignore Type '"unregistered"' is not assignable to type '"active" | "suspended"'.
  status: 'unregistered',
  items: [{ id: 'item-1', amount: 20 }],
});

console.log(err);
// TypeError: Expect value to equal "suspended" {
//   errors: [
//     {
//       error: TypeError: Expect value to equal "suspended",
//       path: ['status']
//     }
//   ]
// }

```

<br>

## Creating new Types

A computed type is any function that can return a value without throwing any exceptions. For
example this type will validate email addresses:

```ts
import * as EmailValidator from 'email-validator';

function Email(input: unknown): string {
  if (!EmailValidator.validate(String(input))) {
    throw new TypeError(`Invalid email address: "${input}"`);
  }

  return input;
}
```

Using the function interface, this type will receive any `unknown` value and try to convert it to
 a valid email address as a `string`. You can use the above validator on schemas as an `Email` type:

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

*Computed-types* automatically detects promise and convert the return type of the `Validator` to
promise as well:
```ts
const UserSchema = {
  username: AvailableUsername,
};
const validator = Schema(UserSchema);

const user = await validator({ username: 'test' });
```

<br>

## Available Types

`import` [`Schema`](#schema), `{` [`unknown`](#unknown), [`string`](#string), [`number`](#number), [`boolean`](#boolean), [`array`](#array) `} from 'computed-types';`

<br />
<br />

### `Schema`

Create a validator from schema object, values or function validators.

```ts
const validator = Schema({
  name: string,
  amount: number,
}, 'Missing name or amount');
```

##### `Schema.either`

OR switch. Create a validator from multiple function validators or schema objects.

```ts
const validator = Schema.either({ foo: string}, { bar: number });
// validate: { foo: string; } | { bar: number; }
```

##### `Schema.merge`

AND switch. Create a validator from multiple function validators or schema objects.
```ts
const validator = Schema.merge({ foo: string}, { bar: number });
// validate: { 
//   foo: string;
//   bar: number; 
// }
```

##### `Schema.enum`

Create a validator from TypeScript enum.

```ts
enum Status {
 OK,
 Invalid,
};

const validator = Schema.enum(Status, 'Invalid status');
```

### `unknown`

Accept any `unknown` value:

```ts
const validator = Schema({
  data: unknown,
});
```

##### `unknown.schema()`

Accept any value as an input and try to convert it the given schema:

```ts
const validator = unknown.schema({
  foo: string.trim(),
})
```

##### `unknown.object()`

Accept any value as an input and try to convert it to an object:

```ts
const validator = Schema({
  data: unknown.object('Expect data to be an object'),
});
```

##### `unknown.array()`

Accept any value as an input and try to convert it to an array:

```ts
const validator = Schema({
  data: unknown.array(),
});
```

##### `unknown.string()`

Accept any value as an input and try to convert it to a string:

```ts
const validator = Schema({
  data: unknown.string('Expect data to be string'),
});

// will accept: `{ data: 1 }` and convert it to `{ data: '1' }`
// will throw: `{ data: null }`
```

##### `unknown.number()`

Accept any value as an input and try to convert it to a number:

```ts
const validator = Schema({
  data: unknown.number('Expect data to be number'),
});
```

##### `unknown.boolean()`

Accept any value as an input and try to convert it to a boolean:

```ts
const validator = Schema({
  data: unknown.boolean('Expect data to be boolean'),
});
```

##### `unknown.enum()`

Accept any value as an input and try to convert it to the given enum:

```ts
enum Status {
  OK,
  Invalid,
}

const validator = Schema({
  status: unknown.enum(Status),
});
```

<br>

## License

[MIT](LICENSE) license &copy; 2020 [Neuledge](https://neuledge.com)
