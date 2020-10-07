import unknown from './unknown';
import object from './object';
import array from './array';
import string from './string';
import number from './number';
import boolean from './boolean';
import Schema from './Schema';
import DateType from './DateType';
import {
  SchemaResolveType,
  SchemaParameters,
  MergeSchemaParameters,
  SchemaReturnType,
  SchemaValidatorFunction,
  SchemaInput,
} from './schema/io';
import { ValidationError, PathError } from './schema/errors';
import { isPromiseLike, ResolvedValue } from './schema/utils';

// type generator
export type Type<S> = SchemaResolveType<S>;

// type helpers
export type {
  ValidationError,
  PathError,
  SchemaInput,
  SchemaParameters,
  MergeSchemaParameters,
  SchemaReturnType,
  SchemaValidatorFunction,
  ResolvedValue,
};

// runtime schema
export default Schema;

// runtime types
export { unknown, object, array, string, number, boolean, DateType };

// runtime helpers
export { isPromiseLike };
