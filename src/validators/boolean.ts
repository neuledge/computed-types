const BOOL_MAP = {
  true: true,
  false: false,
  t: true,
  f: false,
  yes: true,
  no: false,
  y: true,
  n: false,
  1: true,
  0: false,
};

// exported functions

export function Bool(input: unknown): boolean {
  if (typeof input === 'boolean') {
    return input;
  }

  const key = String(input)
    .trim()
    .toLowerCase();

  const value = BOOL_MAP[key as keyof typeof BOOL_MAP];

  if (value != null) {
    return value;
  }

  throw new TypeError(`Invalid boolean value`);
}
