<h1 align="center" style="text-align:center">🦩 Computed Types</h1>

<h4 align="center">Runtime validation types for TypeScript.</h4>

<p align="center">
  <a href="https://www.npmjs.org/package/computed-types">
    <img src="http://img.shields.io/npm/v/computed-types.svg" alt="View On NPM">
  </a>
  <a href="https://github.com/neuledge/computed-types/actions/workflows/build.yml">
    <img src="https://github.com/neuledge/computed-types/actions/workflows/build.yml/badge.svg"
      alt="Build Status">
  </a>
  <a href="https://depfu.com/github/neuledge/computed-types?project_id=12857">
    <img src="https://badges.depfu.com/badges/f49a9b5caba7c3538e1fd9a06a72bca6/overview.svg"
      alt="Dependency Status">
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

**Computed-Types** (formerly: [Funval](https://www.npmjs.org/package/funval)) is a strongly-typed
validation library for TypeScript. Using function interfaces, *computed-types* knows how to
transform and validate your data, and automatically generates accurate TypeScript
interfaces on compile time.

#### Using `computed-types`:
```ts
const UserSchema = Schema({
  name: string,
  amount: number,
  flags: array.of(string).optional();
});

type User = Type<typeof UserSchema>;
```

#### Equivalent code in `Joi`:
```ts
const UserSchema = Joi.object({
  name: Joi.string().required(),
  amount: Joi.number().required(),
  flags: Joi.array().items(Joi.string()),
});

type User = {
  name: string;
  amount: number;
  flags?: string[];
}
```

### Main Features

- **Easy to Read** - Uses runtime types like in TypeScript (including `string`, `array`, `unknown`,
 etc...)
- **Reduce Duplication** - Create new validator using existing functions in seconds.
- **TypeScript Validation** - Detect errors during compile time as well.
- **Function Composition** - Chain multiple validators to generate new types.
- **Data Transformation** - Combine validation and formatting in the one action.
- **Asynchronous & Synchronous Support** - Automatically detected promises and async validation.
- **Zero Dependencies** - Light and compact library.
- **Pure Javascript** - Also works without TypeScript.


<br>

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Creating new Types](#creating-new-types)
- [Validators Chain](#validators-chain)
- [Documentation](#available-types)
- [License](#license)

<br>

## Install

#### Node.js:
```bash
npm i computed-types
```

#### Deno:
```ts
import Schema, { Type, string, number, array } from 'https://denoporter.sirjosh.workers.dev/v1/deno.land/x/computed_types/src/index.ts';
```

<br>

## Usage

```ts
import Schema, { Type, string, number, array } from 'computed-types';

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
const validator = UserSchema.destruct();

const [err, user] = validator({
  username: 'john1',
  // 🚨 TypeScript Error: Type '"unregistered"' is not assignable to type '"active" | "suspended"'.
  status: 'unregistered',
  items: [{ id: 'item-1', amount: 20 }],
});

console.log(err);
// 🚨 ValidationError: Expect value to equal "suspended" {
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

A computed type is any function that can return a value without throwing any exceptions. Creating a custom type 
allows you to normalize, transform and validate any input.

For example this type will validate email addresses:

```ts
import * as EmailValidator from 'email-validator';

function Email(input: unknown): string {
  if (!EmailValidator.validate(String(input))) {
    throw new TypeError(`Invalid email address: "${input}"`);
  }

  return input;
}
```

You can use the above validator on schemas as an `Email` type and it will validate inputs in the
form of `{ email: unknown }` to `{ email: string }` type.

```ts
const UserSchema = {
  email: Email,
};

const validator = Schema(UserSchema);
```

To create optional types, change the validator arguments to optional as well:

```ts
function OptionalEmail(input?: unknown): string | undefined {
  return input == null ? undefined : Email(input);
}
```

This will validate inputs in the form of `{ email?: unknown }` to `{ email: string | undefined }`.

<br>


### Using Transform

The custom Email validator above will not support [validator chaining](#validators-chain), but we can easily
fix this by using the [`.transform()` method](#transform).

```ts
const EmailWithValidatorChain = unknown.string.transform(Email)
```

I can now make use of the validator chain:

```ts
const UserSchema = {
  email: EmailWithValidatorChain.optional().max(100),
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

Trying to access the return value without resolving it with promise first will detect and alert
automatically via TypeScript on compile time.

<br>

## Validators Chain

Every validator in `"computed-types"` is a validation function that can be called and validate
any sort of data. In addition, each validator has a few helper methods to chain multiple
validators together.

For example, check out this use case:

```ts
import { unknown } from 'computed-types';

const validator = unknown.number().gt(0).toFixed(2);

console.log(validator('123.4567')); // '123.46'
```

You can [see here](#available-types) all the custom chain methods for each type. Please note that
 after calling `toFixed`, the validator no longer returns a `number` but a
`string` so all the helpers functions available after `toFixed` will be the `string` helpers.

In addition the type helpers, each validator has those default chain helpers so use:

- [`.equals()`](#equals)
- [`.test()`](#test)
- [`.transform()`](#transform)
- [`.construct()`](#construct)
- [`.optional()`](#optional)
- [`.strictOptional()`](#strictOptional)
- [`.destruct()`](#destruct)
- [`.error()`](#error)

<br>

##### `.equals()`

Verify the return value equals to the given value.

```ts
const validator = boolean.equals(true);
```

##### `.test()`

Verify the return value pass the given test function.

```ts
import * as EmailValidator from 'email-validator';

const validator = string.test(EmailValidator.validate, 'Invalid email address');
```

##### `.transform()`

Transform the return value to a new value or throw to fail the validation process. The return
value can be any value, including different types.

```ts
const validator = number.transform((x): number => {
  if (x <= 0) {
    throw new RangeError('Expected number to be positive');
  }

  return Math.sqrt(x);
});
```

##### `.construct()`

Similar to [`.transform()`](#transform) but less common. This helper is useful when you want to
change the validator input before validating it. The returning value of the construct function
should always return an array as this array will pass to the original validator input as arguments.

```ts
const validator = number.gt(1).construct((x: number, y: number) => [x + y]);
validators(x, y); // x + y
```

##### `.optional()`

Will convert the validator to an optional by allowing `undefined` or `null` values.
This is very useful for parsing when creating optional properties on a schema.

```ts
const validator = Schema({
  name: string.trim().min(1),
  address: string.trim().optional(),
})
```

##### `.strictOptional()`

Same as `.optional()` but allows only `undefined` values.

```ts
const validator = Schema({
  name: string.trim().min(1),
  address: string.trim().optional(),
})
```

##### `.destruct()`

Use this as the final helper on the chain. It will catch any validation error and spread it to a
2-arguments array with an error and possible value on success. Useful if you don't like catching
errors.

```ts
const validator = Schema({
  name: string.trim().min(1),
}).destruct();

const [err, user] = validator(req.body);
```

##### `.error()`

Will catch any error and replace it with your custom error instead. You can pass a `string`,
`ValidationError` or a `function` that will generate an error for you. Notice that on most cases you
will not need to use this helpers, as most validation helpers has an optional `error` param with the
same functionality.

```ts
const validator = Schema({
  name: string.error('expect input to be string'),
  amount: number.gt(0, (val) => `${val} is not positive amount`);
});
```

<br>

## Available Types

It's useful to import the following native types when building custom schemas.
Click on each type to see some validation examples.

**`import`** [`Schema`](#schema), `{` [`unknown`](#unknown), [`string`](#string), [`number`](#number), [`boolean`](#boolean), [`array`](#array), [`DateType`](#datetype) `}` **`from`** `'computed-types';`

<br>

### `Schema`

Create a validator from schema object, values or function validators.

```ts
const validator = Schema({
  name: string,
  amount: number,
}, 'Missing name or amount');
```

##### Strict mode

By default, the schema validator will ignore all properties that aren't exist on the schema. If
you want to throw an error instead you can toggle the strict mode on.

```ts
const validator = Schema({
  name: string,
  amount: number,
}, { strict: true });
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

##### `Schema.record`

Create a `Record<key, value>` validator.

```ts
const validator = Schema.record(string.regexp(/^[a-z]+$/), number);
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

##### `unknown.date()`

Accept any value as an input and try to convert it to a date:

```ts
const validator = unknown.date('Expect data to be date').equals('1970-01-01T00:00:00.050Z');
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

##### `unknown.record()`

Accept any value as an input and try to convert it to a `Record<key, value>`:

```ts
const validator = unknown.record(string, number);
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

##### `string.truncate()`

Truncate a string to a given length with ellipsis (`…`) to the end. If the string below the given
 limit the original string is return.

```ts
const validator = string.truncate(100);
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
```

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

### `DateType`

Accept only instances of `Date`.

```ts
const validator = Schema({
  eventTime: DateType
});
```

##### `DateType.toISOString()`

Accept Date and convert it to ISO date string.

```ts
const validator = DateType.toISOString();
```

##### `DateType.getTime()`

Accept Date and convert it to a timestamp.

```ts
const validator = DateType.getTime().gt(100);
```

##### `DateType.gte()`

Accept Date that greater or equal than the boundary given.

```ts
const validator = DateType.gte(new Date('2020-10-01T10:00:00.000Z'));
```

##### `DateType.lte()`

Accept Date that lower or equal than the boundary given.

```ts
const validator = DateType.lte(new Date('2020-10-01T10:00:00.000Z'));
```

##### `DateType.gt()`

Accept Date that greater than the boundary given.

```ts
const validator = DateType.gt(new Date('2020-10-01T10:00:00.000Z'));
```

##### `DateType.lt()`

Accept Date that lower than the boundary given.

```ts
const validator = DateType.lt(new Date('2020-10-01T10:00:00.000Z'));
```

##### `DateType.between()`

Accept Date between the given boundaries.

```ts
const validator = DateType.between(new Date('2020-09-01T10:00:00.000Z'), new Date('2020-10-01T10:00:00.000Z'));
```

<br>

## License

[MIT](LICENSE) license &copy; 2020 [Neuledge](https://neuledge.com)
