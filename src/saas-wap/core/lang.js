import Vue from 'vue';
import VueI18n from 'vue-i18n';
import languages from '../languages/index.js';

Vue.use(VueI18n);

/**
 * 国际化语言，初始化i18n
 * @param {*} locale
 */
export function initI18n() {
  const i18n = new VueI18n({
    locale: 'zh-CN' || window.$globalConfig.currentLang,
    messages: {
      zh: languages.zh,
      en: languages.en
    }
  });
  return i18n;
}
