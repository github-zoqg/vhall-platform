/**
 * 返回一个值总是在 min~max范围
 * @param {Number} number
 * @param {Number} min
 * @param {Number} max
 * @returns {Number} value
 */
export function clamp(number, min, max) {
  return Math.max(Math.min(max, number), min);
}
