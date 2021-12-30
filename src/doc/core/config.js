import Vue from 'vue';
import { globalConfig, serverConfig } from '../config';

export function initConfig() {
  window.$globalConfig = Vue.prototype.$globalConfig = globalConfig;
  window.$serverConfig = Vue.prototype.$serverConfig = serverConfig;
}
