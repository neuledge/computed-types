<h1>
  <br>
  <br>
  FunVal
  <br>
  <br>
</h1>

<h4>Minimalist library for data validation using plain functions ❤️.</h4>

<p>
<a href="https://www.npmjs.org/package/fanval"><img src="http://img.shields.io/npm/v/fanval.svg" alt="View On NPM"></a>
<a href="https://travis-ci.org/neuledge/fanval"><img src="https://travis-ci.org/neuledge/fanval.svg?branch=master" alt="Build Status"></a>
<a href="https://david-dm.org/neuledge/fanval"><img src="https://david-dm.org/neuledge/fanval.svg" alt="Dependency Status"></a>
<a href="LICENSE"><img src="https://img.shields.io/npm/l/fanval.svg" alt="License"></a>
</p>
<br>

**FunVal** is a minimalist validation library that seamlessly integrates with your existing
TypeScript schemas. Using only pure functions, **FunVal** knows how to validate your data and
automatically generates TypeScript interfaces to reduce code duplications and complexity.

### Features

- **Asynchronous or Synchronous validation** - Automatically detection using your validators.
- **Pure Javascript** - Works also without TypeScript.
- **Seamless interface** - Create new validator using plain functions in seconds.
- **Support function composition** - Pipe multiple validators to generate new ones.
- **TypeScript Input Validation** - Detect errors during compile time. 

### Install

```bash
npm i funval
```

### Usage

```ts
import { Validate, Optional, Or, NonEmptyString, StringRange, Type } from 'funval';
import compose from 'compose-function';

const UserSchema = {
  firstName: Optional(String),
  lastName: Optional(String),
  username: compose(StringRange(3, 20), NonEmptyString),
  status: Or('active' as 'active', 'suspended' as 'suspended'),
  amount: Number,
};

const validator = Validate(UserSchema);

let user: Type<typeof UserSchema>;

try {
  user = validator({
    firstName: 'John',
    username: 'john1',
    // @ts-ignore TS2322: Type '"unregistered"' is not assignable to type '"active" | "suspended"'.
    status: 'unregistered',
    amount: 20.3,
  });
} catch (err) {
  console.error(err.message, err.paths);

  // Expect value to equals "suspended" (given: "unregistered") [
  //   {
  //     path: [ 'status' ],
  //     message: 'Expect value to equals "suspended" (given: "unregistered")'
  //   }
  // ]
}
```


### Creating Validators

A validator is any function that return value. For example here is an email address validator:

```ts
import * as EmailValidator from 'email-validator';

function Email(input: string): string {
  if (!EmailValidator.validate(input)) {
    throw new TypeError(`The given email "${input}" is invalid`);
  }

  return input;
}
```

You can use it on schemas like this:

```ts
const UserSchema = {
  email: Email,
};

const validator = Validate(UserSchema);
```

#### Asynchronous Validators

You can even create asynchronous validators that resolve to a `Promise`:

```ts
import fetch from 'node-fetch';

async function AvailableUsername(input: string): Promise<string> {
  const res = await fetch(`/check-username?username=${encodeURIComponent(input)}`);

  if (!res.ok) {
    throw new TypeError(`Username "${input}" is already taken`);
  }

  return input;
}


const UserSchema = {
  username: AvailableUsername,
};

const validator = await Validate(UserSchema);
```


### License

&copy; 2020 Moshe Simantov

Licensed under the [MIT](LICENSE).
