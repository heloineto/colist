import { useState, useCallback, useEffect } from 'react';
import cookies from 'js-cookie';
import { deserializeJSON } from './utils/deserialize-json';
import { serializeJSON } from './utils/serialize-json';

interface UseCookieParams<T> extends Cookies.CookieAttributes {
  /** Storage key */
  key: string;

  /** Default value that will be set if value is not found in storage */
  defaultValue?: T;

  /** Function to serialize value into string to be save in storage */
  serialize?: (value: T) => string;

  /** Function to deserialize string value from storage to value */
  deserialize?: (value: string | undefined) => T;
}

export function useCookie<T = string>({
  key,
  defaultValue,
  deserialize = deserializeJSON as (value: string | undefined) => T,
  serialize = (value: T) => serializeJSON(value),
  ...options
}: UseCookieParams<T>) {
  const readStorageValue = useCallback(
    (): T => {
      const storageValue = cookies.get(key);

      return storageValue !== undefined
        ? deserialize(storageValue)
        : (defaultValue as T);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps --- deserialize should be static
    [key, defaultValue]
  );

  const [value, setValue] = useState<T>(readStorageValue);

  const setStorageValue = useCallback(
    (newValue: T | ((prevState: T) => T)) => {
      if (newValue instanceof Function) {
        setValue((current) => {
          const result = newValue(current);
          cookies.set(key, serialize(result), options);
          return result;
        });
      } else {
        cookies.set(key, serialize(newValue), options);
        setValue(newValue);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps --- serialize should be static
    [key]
  );

  const removeStorageValue = useCallback(() => {
    cookies.remove(key);
  }, [key]);

  useEffect(() => {
    if (defaultValue !== undefined && value === undefined) {
      setStorageValue(defaultValue);
    }
  }, [defaultValue, value, setStorageValue]);

  useEffect(
    () => {
      const val = readStorageValue();
      val !== undefined && setStorageValue(val);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps --- should only run on mount
    []
  );

  return [
    value === undefined ? defaultValue : value,
    setStorageValue,
    removeStorageValue,
  ] as [T, (value: T | ((previous: T) => T)) => void, () => void];
}
