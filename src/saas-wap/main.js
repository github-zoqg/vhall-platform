import Vue from 'vue';
// js内置对象扩展
import '@/app-shared/extension/native-ext';
// 控制台日志打印处理
import '@/packages/app-shared/utils/vlog';
// 移动端字体大小自适应处理
import './init-global/resize-font-size.js';
// 全局属性的定义
import './init-global/prototype.js';
// 导入根组件
import App from './App.vue';
// 导入路由
import router from './router';
// 引入国际化组件
import i18n from '@/app-shared/i18n/index';
// domain store
import domainStore from './init-global/store';
// 组件use
import './init-global/use';
// 全局混入
import '@/app-shared/mixins/index';
// 全局指令
// import '@/app-shared/directives/index';
// 全局过滤器
import '@/app-shared/filters/index';
// 导入样式及皮肤
import './assets/styles/common.less';
import './assets/styles/skins/index.less';

Vue.config.productionTip = false;
Vue.config.devtools = true;

new Vue({
  router,
  i18n,
  domainStore,
  render: h => h(App)
}).$mount('#app');
