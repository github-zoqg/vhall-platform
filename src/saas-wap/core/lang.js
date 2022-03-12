import Vue from 'vue';
import VueI18n from 'vue-i18n';
import languages from '../languages/index.js';
import defaultLanguageConf from '../languages/default.config.js';

Vue.use(VueI18n);

// Vuei18n增加方法，匹配不到code返回undefined
Vue.prototype.$tec = function (path) {
  return this.$te(path) ? this.$t(path) : undefined;
};

Vue.prototype.$tdefault = function (key) {
  return defaultLanguageConf[key] ? this.$t(defaultLanguageConf[key]) : key;
};

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
