export function computeRecordTime(val) {
  const s = val; // 秒
  let m = 0; // 分
  if (s > 59) {
    m = s / 60;
  }
  return parseInt(m);
}
