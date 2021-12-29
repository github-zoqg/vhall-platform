import Vue from 'vue';
import { globalConfig, serverConfig } from '../config';
import clipboard from 'clipboard';

export function initConfig() {
  window.$globalConfig = Vue.prototype.$globalConfig = globalConfig;
  window.$serverConfig = Vue.prototype.$serverConfig = serverConfig;
  Vue.prototype.$clipboard = clipboard;
}
