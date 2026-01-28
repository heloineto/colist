const KEY_PREFIX = 'postgrest';
const INFINITE_KEY_PREFIX = 'page';

interface Params {
  isInfinite?: boolean;
  schema?: string;
  table?: string;
  queryKey?: string;
  bodyKey?: string;
  count?: number;
  isHead?: boolean;
  orderByKey?: string;
}

export function getQueryKey({
  isInfinite = false,
  schema = 'public',
  table,
  queryKey,
  bodyKey,
  count,
  isHead,
  orderByKey,
}: Params) {
  const key = [KEY_PREFIX, isInfinite ? INFINITE_KEY_PREFIX : 'null', schema];

  if (!table) return key;
  key.push(table);

  if (!queryKey) return key;
  key.push(queryKey);

  if (!bodyKey) return key;
  key.push(bodyKey);

  if (!count) return key;
  key.push(`count=${count}`);

  if (!isHead) return key;
  key.push(`head=${isHead}`);

  if (!orderByKey) return key;
  key.push(orderByKey);

  return key;
}
