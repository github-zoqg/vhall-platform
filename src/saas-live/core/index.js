import { initGlobalPrototype } from './prototype';
import { initUse } from './use';
import { initMixin } from './mixin';
import { initI18n } from './lang';

// 初始化全局属性
initGlobalPrototype();

// 初始化全局组件，全局混入,...
export function initGlobalAPI() {
  initUse();
  initMixin();
}

export const i18n = initI18n();
