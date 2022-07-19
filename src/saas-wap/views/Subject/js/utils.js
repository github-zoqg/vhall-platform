export function urlToLink(str) {
  if (!str) return '';
  const regImg = /<img.*?(?:>|\/>)/g;
  const imgArr = str.match(regImg);
  const strArr = str.split(regImg);
  const regUrl = /(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])/g;
  strArr.forEach((item, index) => {
    const tempStr = item.replace(regUrl, function (match) {
      return `<a class='show-link' href='${match}' target='_blank'>${match}</a>`;
    });
    strArr[index] = tempStr;
  });
  if (imgArr) {
    const imgArrLength = imgArr.length;
    let imgIndex = 0;
    for (let strIndex = 0; strIndex < imgArrLength; ++strIndex) {
      strArr.splice(strIndex + imgIndex + 1, 0, imgArr[imgIndex]);
      imgIndex++;
    }
  }
  return strArr.join('');
}

export function padStringWhenTooLang(originString, padString = '', length) {
  if (originString.length <= length) return originString;

  return originString.substring(0, length - 1) + padString;
}
