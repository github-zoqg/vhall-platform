//图片经阿里云转换
export function resizeImg(url, { type, width, height }) {
  if (url.indexOf('?x-oss-process=image/resize') < 0) {
    url += `?x-oss-process=image/resize,w_${width},h_${height},${type}`;
  }
  return url;
}
