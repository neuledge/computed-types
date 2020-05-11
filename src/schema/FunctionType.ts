export type FunctionParameters = unknown[];

export type MergeFirstParameter<P extends FunctionParameters> = [P] extends [[]]
  ? []
  : [P] extends [[unknown]]
  ? [P[0]]
  : P;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FunctionType<R = any, P extends FunctionParameters = any[]> = (
  ...args: P
) => R;

export default FunctionType;
