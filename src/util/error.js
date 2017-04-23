// @flow

export function isJsError(err: mixed) {
  return (
    err instanceof TypeError ||
    err instanceof SyntaxError ||
    err instanceof ReferenceError ||
    err instanceof RangeError
  );
}
