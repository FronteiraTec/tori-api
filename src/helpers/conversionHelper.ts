export function toBoolean(string?: string | boolean | number) {
  if (string === undefined)
    return undefined;
  if (string == "false")
    return false;
  if (string == "0")
    return false;
  if (string == false)
    return false;
  if (string == 0)
    return false;

  return true;
}
