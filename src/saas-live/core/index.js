import './extend';
import { initGlobalPrototype } from './prototype';
import { initUse } from './use';
import { initPureServer } from './pure';
import { initMixin } from './mixin';
import { initI18n } from './lang';

// 初始化全局属性
initGlobalPrototype();

// 初始化全局组件，全局混入,...
export function initGlobalAPI() {
  // 注册纯服务
  initPureServer();

  // 全局注册组件
  initUse();

  // 全局混入
  initMixin();
}
export const i18n = initI18n();
