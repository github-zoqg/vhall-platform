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

/**
 * 分率计算转换,保留小数1位
 */
export function roundRate(number) {
  if (number === '' || number === null || isNaN(number)) return ''
  number = parseFloat(number)
  if (number < 0) return ''
  number = Math.round(number * 10) / 10
  return `${number}`
}