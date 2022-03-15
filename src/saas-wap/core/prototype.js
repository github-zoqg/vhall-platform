import Vue from 'vue';
import { globalConfig, serverConfig } from '../page-config';
import moment from 'moment';

export function initGlobalPrototype() {
  // 初始化全局变量挂载到 window 上
  window.$globalConfig = globalConfig;
  window.$serverConfig = serverConfig;

  // 初始化全局变量挂载的 vue 实例上
  Vue.prototype.$moment = moment;

  Object.defineProperty(window.$globalConfig, 'currentLang', {
    enumerable: true,
    configurable: true,
    set: function (value) {
      localStorage.setItem('lang', value);
    },
    get: function () {
      return localStorage.getItem('lang') == 2
        ? 'en'
        : localStorage.getItem('lang') == 1
        ? 'zh'
        : 'es' || 'zh';
    }
  });

  Object.defineProperty(window.$globalConfig, 'currentSkin', {
    enumerable: true,
    configurable: true,
    set: function (value) {
      localStorage.setItem('skin', value);
    },
    get: function () {
      return localStorage.getItem('skin') || window.$globalConfig?.skin || 'default';
    }
  });
}
