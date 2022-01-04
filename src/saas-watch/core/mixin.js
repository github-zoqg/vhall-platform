import Vue from 'vue';
import serverRegisterMixin from '@/packages/app-shared/mixins/server-register';

export function initMixin() {
  // 全局混入注册逻辑
  Vue.mixin(serverRegisterMixin);
}
