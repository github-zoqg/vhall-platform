export function getBase64Image(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width, img.height);

  const dataURL = canvas.toDataURL('image/png');
  return dataURL;
}

export function padStringWhenTooLang(originString, padString = '', length) {
  if (originString.length <= length) return originString;

  return originString.substr(0, length - 1) + padString;
}

/**
 * 格式化desc
 * @param {String} originDesciption
 * @returns {String} desc
 */
export function formatDesc(originDesciption) {
  let desc = originDesciption.replace(/&nbsp;/g, '');
  desc = desc.replace(/<[^>]+>|&[^>]+;/g, '');
  desc = desc.length > 32 ? `${desc.trim().substring(0, 30)}...` : desc.trim();

  return desc;
}
