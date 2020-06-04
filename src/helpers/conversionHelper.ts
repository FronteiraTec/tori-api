export function toBoolean(string?: string) {
  if (string === undefined)
    return undefined;
  if (string === "false")
    return false;
  if (string === "0")
    return false;
  return true;
}
