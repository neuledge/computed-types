import { isPrimitive, Primitive } from './utils.ts';
import FunctionType from './FunctionType.ts';

export type SwitchKey = [string, Map<Primitive, number>];

// exported functions

export function findSwitchKey(
  ...candidates: [unknown, ...unknown[]]
): SwitchKey | null {
  const firstCandidate = candidates[0];
  if (
    candidates.length < 2 ||
    typeof firstCandidate !== 'object' ||
    firstCandidate === null
  ) {
    return null;
  }

  let values: SwitchKey[1] = new Map();
  const switchKey = Object.keys(firstCandidate).find((key): boolean => {
    const firstValue = firstCandidate[key as keyof typeof firstCandidate];
    if (!isPrimitive(firstValue)) {
      return false;
    }

    values = new Map([[firstValue, 0]]);

    for (let i = 1; i < candidates.length; i += 1) {
      const candidate = candidates[i];
      if (typeof candidate !== 'object' || candidate === null) {
        return false;
      }

      const value = candidate[key as keyof typeof candidate];

      if (!isPrimitive(value) || values.has(value)) {
        return false;
      }

      values.set(value, i);
    }

    return true;
  });

  if (switchKey === undefined) {
    return null;
  }

  return [switchKey, values];
}

export function generateSwitch(
  switchKey: SwitchKey,
  validators: FunctionType[],
): FunctionType {
  const [key, values] = switchKey;

  return (...args: unknown[]): unknown => {
    const obj = args[0];
    let index: number;

    if (typeof obj === 'object' && obj !== null) {
      const value = obj[key as keyof typeof obj];
      index = values.get(value) || 0;
    } else {
      index = 0;
    }

    return validators[index](...args);
  };
}
