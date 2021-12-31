import Vue from 'vue';
// element-ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import VueHighlightJS from 'vue-highlightjs';

// 组件库组件
import { dynamicLoadComponent } from '../utils/dynamicLoad';
// 全局注册组件
export function initUse() {
  Vue.use(ElementUI);

  Vue.use(VueHighlightJS);
  dynamicLoadComponent().forEach(comp => {
    Vue.use(comp);
  });
}
