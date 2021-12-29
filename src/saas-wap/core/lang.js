import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

/**
 * 国际化语言，初始化i18n
 * @param {*} locale
 */
export function initI18n(lang = 'zh') {
  const lan = localStorage.getItem('lang');
  const i18n = new VueI18n({
    locale: lan || window.$globalConfig?.lang || lang,
    messages: {
      zh: require('../languages/zh-CN.js'),
      en: require('../languages/en-US.js')
    }
  });
  return i18n;
}
