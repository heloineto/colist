export function serializeJSON<T>(value: T) {
  try {
    return JSON.stringify(value);
  } catch (error) {
    throw new Error(`use-cookie: Failed to serialize the value`);
  }
}
