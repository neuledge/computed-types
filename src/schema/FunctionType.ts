export type FunctionParameters = unknown[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FunctionType<R = any, P extends FunctionParameters = any[]> = (
  ...args: P
) => R;

export default FunctionType;
