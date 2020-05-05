// exported functions

export function Float(input: unknown): number {
  if (input == null) {
    throw new TypeError(`Missing number`);
  }

  const res = Number(input);

  if (isNaN(res)) {
    throw new TypeError(`Expect value to be a number`);
  }

  return res;
}

export function Integer(input: unknown): number {
  const value = Float(input);

  if (!Number.isInteger(value)) {
    throw new TypeError(`"${value}" is not an integer`);
  }

  return value;
}
