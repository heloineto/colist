export function joinStoragePaths(...paths: string[]) {
  if (paths.length === 0) return '';
  let joined;

  for (const path of paths) {
    if (path.length > 0) {
      if (joined === undefined) joined = path;
      else joined += `/${path}`;
    }
  }

  if (joined === undefined) return '';
  return joined;
}
