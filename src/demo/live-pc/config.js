import Vue from 'vue';
import Aside from '@/packages/aside';
Vue.use(Aside);

export default {
  // 全局
  global: {
    liveType: 'common',
    lang: 'en',
    styles: {
      background: 'lightgreen',
      color: '#fff',
      margin: '10px',
      padding: '10px',
      'border-radius': '6px'
    }
  },
  // 服务
  services: [
    {
      mount: 'leftAside',
      component: Aside,
      props: {
        width: '200px'
      }
    }
  ]
};
