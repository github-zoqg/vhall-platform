//图片经阿里云转换
export function resizeImg(url, { type, width, height }) {
  if (url && url.indexOf('?x-oss-process=image/resize') < 0) {
    url += `?x-oss-process=image/resize,w_${width},h_${height},${type}`;
  }
  return url;
}

//图片经阿里云转换
export function cropperImage(url) {
  if (url && url.indexOf('?x-oss-process') != -1) {
    return true;
  } else {
    return false;
  }
}
