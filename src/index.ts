import unknown from './unknown';
import object from './object';
import array from './array';
import string from './string';
import number from './number';
import boolean from './boolean';
import Schema from './Schema';
import { SchemaResolveType } from './schema/io';

export default Schema;

export type Type<S> = SchemaResolveType<S>;

export { unknown, object, array, string, number, boolean };
