import { GreaterThan, GreaterThanEqual } from './comparison';

// exported functions

export function ValidNumber(input: unknown): number {
  const res = Number(input);

  if (isNaN(res)) {
    throw new TypeError(`${input} is not a number`);
  }

  return res;
}

export function Integer(input: number): number {
  if (!Number.isInteger(input)) {
    throw new TypeError(`${input} is not an integer`);
  }

  return input;
}

export function FiniteNumber(input: number): number {
  if (!Number.isFinite(input)) {
    throw new TypeError(`${input} is not an finite`);
  }

  return input;
}

export const NonNegative = GreaterThanEqual(0);
export const Positive = GreaterThan(0);
