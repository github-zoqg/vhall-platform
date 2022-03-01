import Vue from 'vue';
import { globalConfig, serverConfig } from '../config';
import moment from 'moment';
import pkg from '../package.json';

export function initGlobalPrototype() {
  // 初始化全局变量挂载到 window 上
  window.$globalConfig = globalConfig;
  window.$serverConfig = serverConfig;
  window.$middleInfo = pkg;

  // 初始化全局变量挂载的 vue 实例上
  Vue.prototype.$moment = moment;

  Object.defineProperty(window.$globalConfig, 'currentLang', {
    enumerable: true,
    configurable: true,
    set: function (value) {
      localStorage.setItem('lang', value);
    },
    get: function () {
      return localStorage.getItem('lang') || window.$globalConfig?.lang || 'zh';
    }
  });

  Object.defineProperty(window.$globalConfig, 'currentSkin', {
    enumerable: true,
    configurable: true,
    set: function (value) {
      localStorage.setItem('skin', value);
    },
    get: function () {
      return localStorage.getItem('skin') || window.$globalConfig?.skin || '';
    }
  });
}
