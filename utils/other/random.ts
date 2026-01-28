export function getHash(str: string) {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

export function random(seed: number, min: number, max: number) {
  const hash = getHash((seed / (seed + 1)).toString());
  return (hash % (max - min + 1)) + min;
}
