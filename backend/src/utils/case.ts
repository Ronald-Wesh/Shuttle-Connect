const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

const toCamelKey = (key: string) =>
  key.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase());

export const toCamelCaseDeep = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => toCamelCaseDeep(item));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.entries(value).reduce<Record<string, unknown>>(
    (result, [key, nestedValue]) => {
      result[toCamelKey(key)] = toCamelCaseDeep(nestedValue);
      return result;
    },
    {}
  );
};
