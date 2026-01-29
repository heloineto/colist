export function deserializeJSON(value: string | undefined) {
  try {
    return (value && JSON.parse(value)) as unknown;
  } catch {
    return value;
  }
}
