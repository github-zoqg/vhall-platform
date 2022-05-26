/**
 * 全局自定义指令
 */
import Vue from 'vue';
import { preventReClick } from './preventReClick';
import { clickoutside } from './clickoutside';

Vue.directive(preventReClick.name, preventReClick.option);
Vue.directive(clickoutside.name, clickoutside.option);
