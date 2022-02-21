export function getDiffObject(source, current, { ignoreKeys = [] }) {
  let diff = {};

  for (const key in current) {
    if (Object.hasOwnProperty.call(current, key)) {
      if (ignoreKeys.includes(key)) continue;
      if (current[key] !== source[key]) {
        diff[key] = current[key];
      }
    }
  }

  return diff;
}
