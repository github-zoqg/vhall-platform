import Vue from 'vue';
import VmpContainer from '@/packages/container';
import VmpAsideMenu from '@/packages/aside-menu';
import VmpIconText from '@/packages/icon-text';
Vue.use(VmpContainer);
Vue.use(VmpAsideMenu);
Vue.use(VmpIconText);

const layoutConfig = {
  liveType: 'common',
  lang: 'en',
  styles: {
    background: 'lightgreen',
    color: '#fff',
    margin: '10px',
    padding: '10px',
    'border-radius': '6px'
  }
};

// 服务配置
const serverConfig = {
  // 文档菜单
  docIconText: {
    component: 'VmpIconText',
    options: {
      kind: 'document',
      icon: 'iconfont icon-DOCUMENT',
      text: 'i18n.asideMenu.document'
    },
    onapis: {
      handleClick: {
        cuid: 'wbIconText',
        method: 'onSelected',
        args: { a: 1 }
      }
    },
    emitapis: {
      'wbIconText:onSelected': {
        cuid: 'wbIconText',
        method: 'onSelected',
        args: { a: 1 }
      }
    }
  },
  // 白板菜单
  wbIconText: {
    component: 'VmpIconText',
    options: {
      kind: 'whiteboard',
      icon: 'iconfont icon-Whiteboard',
      text: 'i18n.asideMenu.whiteBoard'
    }
  },
  // 左侧导航菜单
  asideMenu: {
    component: 'VmpAsideMenu',
    children: ['docIconText', 'wbIconText']
  }
};

window.$serverPool = Vue.prototype.$serverPool = new Map();
Vue.prototype.$serverConfig = serverConfig;
Vue.prototype.$layoutConfig = layoutConfig;
