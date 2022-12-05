/**
 * 全局自定义指令
 */
import Vue from 'vue';
import { preventReClick } from './preventReClick';
import { clickoutside } from './clickoutside';
import { drag } from './drag';
import { parseImgOss } from './parseImgOss';

Vue.directive(preventReClick.name, preventReClick.option);
Vue.directive(drag.name, drag.option);
Vue.directive(clickoutside.name, clickoutside.option);
Vue.directive(parseImgOss.name, parseImgOss.option);
