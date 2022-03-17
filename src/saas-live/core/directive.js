import Vue from 'vue';
import { clickoutside } from '@/packages/app-shared/directive/clickoutside';

export default function initDirective() {
  Vue.directive(clickoutside.name, clickoutside.option);
}
