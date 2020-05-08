type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
type RemoveAny<T> = [T] extends [object]
  ? {
      [K in keyof T]: RemoveAny<T[K]>;
    }
  : IfAny<T, never, T>;
type IfEqual<T, R, Y, N> = [R] extends [T] ? ([T] extends [R] ? Y : N) : N;
type IfDeepEqual<T, R, Y, N> = IfEqual<RemoveAny<T>, RemoveAny<R>, Y, N>;

export function typeCheck<T, R, Y = 'ok'>(
  ok: IfDeepEqual<T, R, IfAny<T, IfAny<R, Y, T>, IfAny<R, T, Y>>, T>,
): unknown {
  return ok;
}
