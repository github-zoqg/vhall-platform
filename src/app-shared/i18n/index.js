import Vue from 'vue';
import VueI18n from 'vue-i18n';
import languages from './languages/index.js';
import defaultLanguageConf from './languages/default.config.js';

Vue.use(VueI18n);

// Vuei18n增加方法，匹配不到code返回undefined
Vue.prototype.$tec = function (path) {
  return this.$te(path) ? this.$t(path) : undefined;
};

Vue.prototype.$tdefault = function (key) {
  if (this.$t) {
    return defaultLanguageConf[key] ? this.$t(defaultLanguageConf[key]) : key;
  } else {
    return defaultLanguageConf[key] ? this.t(defaultLanguageConf[key]) : key;
  }
};

const i18n = new VueI18n({
  locale: window.$globalConfig.currentLang || 'zh',
  messages: {
    zh: languages.zh,
    en: languages.en
  }
});
window.i18n = i18n;
export default i18n;
