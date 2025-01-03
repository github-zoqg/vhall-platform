import Vue from 'vue';
import { globalConfig } from '../page-config/global';

// 初始化全局变量挂载到 window 上
window.$globalConfig = globalConfig;
Object.defineProperty(window.$globalConfig, 'currentLang', {
  enumerable: true,
  configurable: true,
  set: function (value) {
    localStorage.setItem('lang', value);
  },
  get: function () {
    if (localStorage.getItem('lang')) {
      return localStorage.getItem('lang') == 2
        ? 'en'
        : localStorage.getItem('lang') == 1
        ? 'zh'
        : 'es' || 'zh';
    } else {
      return 'zh';
    }
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
