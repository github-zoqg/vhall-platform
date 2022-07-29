import cssVars from 'css-vars-ponyfill';

export const setTheme = themeMap => {
  const body = document.body;

  /* 实现方式一 */
  Object.keys(themeMap).forEach(key => {
    body.style.setProperty(key, themeMap[key]);
  });

  /* 实现方式二 */
  // body.style.setProperty('thee', isLight ? 'light' : 'dark')

  // 实现兼容方案
  cssVars({
    watch: true, // 添加、删除、修改 <link> 或 <style> 元素的禁用或 href 属性时，ponyfill 将自行调用
    variables: themeMap, // variables 自定义属性名/值对的集合
    onlyLegacy: false // false 默认将 css 变量编译为浏览器识别的 css 样式 : true 当浏览器不支持css变量的时候将css变量编译为识别的css
  });
};
