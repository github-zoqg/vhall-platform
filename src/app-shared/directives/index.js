/**
 * 全局自定义指令
 */
import Vue from 'vue';
import { preventReClick } from './preventReClick';
import { stopReClick } from './stopReClick';
import { clickoutside } from './clickoutside';
import { loadMore } from './loadMore';
import { drag } from './drag';

Vue.directive(preventReClick.name, preventReClick.option);
Vue.directive(stopReClick.name, stopReClick.option);
Vue.directive(drag.name, drag.option);
Vue.directive(clickoutside.name, clickoutside.option);
Vue.directive(loadMore.name, loadMore.option);
