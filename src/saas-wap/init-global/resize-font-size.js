// 移动端自适应时动态设置html根元素的字体大小
function setHtmlFontSize() {
  const htmlWidth = document.documentElement.clientWidth || document.body.clientWidth;
  const htmlDom = document.getElementsByTagName('html')[0];
  htmlDom.style.fontSize = htmlWidth / 10 + 'px';
}
window.onresize = setHtmlFontSize;
setHtmlFontSize();
