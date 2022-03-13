import './extend';
import { initGlobalPrototype } from './prototype';
import { initUse } from './use';
import { initMixin } from './mixin';
import { initI18n } from './lang';
import { initRoleFilter } from '@/packages/app-shared/filters/role-filter';

// 初始化全局属性
initGlobalPrototype();

// 初始化全局组件，全局混入,...
export function initGlobalAPI() {
  // 全局注册组件
  initUse();

  // 全局混入
  initMixin();
}

export const i18n = initI18n();

initRoleFilter(i18n);
