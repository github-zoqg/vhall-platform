import cssVars from 'css-vars-ponyfill';

/**
 * 获取更新主题色的 DOM 元素
 * @param {String|Object} el 选择器 | Element
 * @returns Element
 */
function queryTargetElement(el) {
  if (!el) return document.body;
  if (typeof el === 'string') {
    const selected = document.querySelector(el);
    if (!selected) {
      console.warn('Cannot find element: ' + el);
      return document.body;
    }
    return selected;
  } else {
    return el;
  }
}

/**
 * 更新主题色
 * @param {Object} themeMap css变量对应的map
 * @param {Object} el 要更改css变量的元素，默认值为 body
 */
export const setTheme = (themeMap, el) => {
  const targetElement = queryTargetElement(el);

  /* 实现方式一 */
  Object.keys(themeMap).forEach(key => {
    targetElement.style.setProperty(key, themeMap[key]);
  });

  /* 实现方式二 */
  // targetElement.style.setProperty('thee', isLight ? 'light' : 'dark')

  // 实现兼容方案
  cssVars({
    watch: true, // 添加、删除、修改 <link> 或 <style> 元素的禁用或 href 属性时，ponyfill 将自行调用
    variables: themeMap, // variables 自定义属性名/值对的集合
    onlyLegacy: true // false 默认将 css 变量编译为浏览器识别的 css 样式 : true 当浏览器不支持css变量的时候将css变量编译为识别的css
  });
};
