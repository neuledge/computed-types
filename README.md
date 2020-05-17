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

It's usuful to import the following native types when building custom schemas.
Click on each type to see some validation examples.

**`import`** [`Schema`](#schema), `{` [`unknown`](#unknown), [`string`](#string), [`number`](#number), [`boolean`](#boolean), [`array`](#array) `}` **`from`** `'computed-types';`

<br>

### `Schema`

Create a validator from schema object, values or function validators.

```ts
const validator = Schema({
  name: string,
  amount: number,
}, 'Missing name or amount');
```

##### `Schema.either`

Works as OR switch. Create a validator from multiple function validators or schema objects.

```ts
const validator = Schema.either({ foo: string}, { bar: number });
// validate: { foo: string; } | { bar: number; }
```

##### `Schema.merge`

Works as AND switch. Create a validator from multiple function validators or schema objects.
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

<br>

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
const validator = unknown.object('Expect data to be an object');
```

##### `unknown.array()`

Accept any value as an input and try to convert it to an array:

```ts
const validator = unknown.array().min(1).of(boolean);
```

##### `unknown.string()`

Accept any value as an input and try to convert it to a string:

```ts
const validator = unknown.string('Expect data to be string').toUpperCase();

// will accept: `{ data: 1 }` and convert it to `{ data: '1' }`
// will throw: `{ data: null }`
```

##### `unknown.number()`

Accept any value as an input and try to convert it to a number:

```ts
const validator = unknown.number('Expect data to be number').gt(0);
```

##### `unknown.boolean()`

Accept any value as an input and try to convert it to a boolean:

```ts
const validator = unknown.boolean('Expect data to be boolean').equals(true);
```

##### `unknown.enum()`

Accept any value as an input and try to convert it to the given enum:

```ts
enum Status {
  OK,
  Invalid,
}

const validator = unknown.enum(Status);
```

<br>

### `string`

Accept only string values (including empty strings).

```ts
const validator = Schema({
  content: string,
});
```

##### `string.toLowerCase()`

Accept string and convert it to lower case.

```ts
const validator = string.toLowerCase().trim();
```

##### `string.toUpperCase()`

Accept string and convert it to upper case.

```ts
const validator = string.toUpperCase().trim();
```

##### `string.toLocaleLowerCase()`

Accept string and convert it to local lower case.

```ts
const validator = string.toLocaleLowerCase('en-US').trim();
```

##### `string.toLocaleUpperCase()`

Accept string and convert it to local upper case.

```ts
const validator = string.toLocaleUpperCase('en-US').trim();
```

##### `string.trim()`

Accept string and trim it.

```ts
const validator = string.trim();
```

##### `string.normalize()`

Accept string and normalize it.

```ts
const validator = string.normalize();
```

##### `string.min()`

Accept string with minimum given length.

```ts
const validator = string.min(2).toLowerCase();
```

##### `string.max()`

Accept string with maximum given length.

```ts
const validator = string.max(10).toUpperCase();
```

##### `string.between()`

Accept string within the given length range.

```ts
const validator = string.between(2, 10).trim();
```

##### `string.regexp()`

Accept only strings that match the given regular expression.

```ts
const validator = string.regexp(/^Hello/).trim();
```

<br>

### `number`

Accept only number type values.

```ts
const validator = Schema({
  amount: number
});
```

##### `number.float()`

Accept only floating numbers (throws on NaN or non-finite values).

```ts
const validator = number.float().gt(0);
```

##### `number.integer()`

Accept only integer numbers.

```ts
const validator = number.integer().gt(0);
```

##### `number.toExponential()`

Accept number and convert it to exponential format string.

```ts
const validator = number.toExponential().toUpperCase();
```

##### `number.toFixed()`

Accept number and convert it to fixed format string.

```ts
const validator = number.toFixed(3);
```

##### `number.toLocaleString()`

Accept number and convert it to locale string.

```ts
const validator = number.toLocaleString('en-US');
```

##### `number.toPrecision()`

Accept number and convert it to precision string.

```ts
const validator = number.toPrecision(2);
```

##### `number.toString()`

Accept number and convert it to string.

```ts
const validator = number.toString(16).toUpperCase();
```

##### `number.gte()`

Accept number that greater or equal than the boundary given.

```ts
const validator = number.gte(1.5);
```

##### `number.lte()`

Accept number that lower or equal than the boundary given.

```ts
const validator = number.lte(10.5);
```

##### `number.gt()`

Accept number that greater than the boundary given.

```ts
const validator = number.gt(1.5);
```

##### `number.lt()`

Accept number that lower than the boundary given.

```ts
const validator = number.lt(10.5);
```

##### `number.between()`

Accept number between the given boundaries.

```ts
const validator = number.between(0, 1);
```

<br>

### `boolean`

Accept only boolean type values.

```ts
const validator = Schema({
  agree: boolean
});

<br>

### `array`

Accept only array type values.

```ts
const validator = Schema({
  agree: array
});

##### `array.of()`

Accept only array with given items.

```ts
const numbers = array.of(number); // numbers[]
const tuple = array.of(number).between(1, 2); // [number, number?]
const objects = array.of({ foo: number }); // { foo: number }[]
const enums = array.of(Schema.enum(Status); // Status[]
```

##### `array.min()`

Accept only array with minimum given items.

```ts
const validator = array.min(2);
```

##### `array.max()`

Accept only array with maximum given items.

```ts
const validator = array.max(10);
```

##### `array.between()`

Accept only array with minimum and maximum count of items.

```ts
const validator = array.between(2, 10);
```

<br>

## License

[MIT](LICENSE) license &copy; 2020 [Neuledge](https://neuledge.com)
