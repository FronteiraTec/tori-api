export function toBoolean(str?: string | boolean | number) {
  if (str === undefined)
    throw new Error("Boolean should not be undefined");
  if (str === "false")
    return false;
  if (str === "0")
    return false;
  if (str === false)
    return false;
  if (str === 0)
    return false;

  return true;
}
