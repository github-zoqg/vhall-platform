/*
 * @Author: your name
 * @Date: 2022-01-01 15:02:15
 * @LastEditTime: 2022-01-02 17:10:02
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /middle-platform/src/saas-live/core/lang.js
 */
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
    locale: window.$globalConfig.currentLang || 'zh',
    messages: {
      zh: languages.zh,
      en: languages.en
    }
  });
  return i18n;
}
