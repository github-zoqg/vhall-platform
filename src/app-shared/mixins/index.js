/**
 * 全局混入
 */
import Vue from 'vue';
import serverRegisterMixin from './server-register';

// 全局混入注册逻辑
Vue.mixin(serverRegisterMixin);
