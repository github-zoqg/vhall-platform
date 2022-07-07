import Vue from 'vue';
import { globalConfig } from '../page-config/global';
import moment from 'moment';

// 初始化全局变量挂载到 window 上
window.$globalConfig = globalConfig;
Object.defineProperty(window.$globalConfig, 'currentLang', {
  enumerable: true,
  configurable: true,
  set: function (value) {
    localStorage.setItem('lang', value);
  },
  get: function () {
    return window.$globalConfig?.lang || 'zh';
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
