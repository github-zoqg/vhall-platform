import Vue from 'vue';
import VmpContainer from '@/packages/container';
import VmpIconText from '@/packages/icon-text';
import serverRegisterMixin from '@/packages/mixins/server-register';
Vue.use(VmpContainer);
Vue.use(VmpIconText);
// 全局混入注册逻辑
Vue.mixin(serverRegisterMixin);

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
    emitClick: {
      sendToServer: false,
      command: 'wbIconText:setSelectedState',
      messsage: {
        arg: false
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
    },
    emitClick: [
      {
        cuid: 'docIconText',
        method: 'setSelectedState',
        args: [false]
      }
    ]
  },
  // 左侧导航菜单
  asideMenu: {
    component: 'VmpContainer',
    options: {
      className: 'vmp-aside-menu'
    },
    children: ['docIconText', 'wbIconText']
  },
  // 顶部容器
  headerContainer: {
    component: 'VmpContainer',
    options: {
      className: 'vmp-header-container'
    }
    // children: []
  }
};

window.$serverPool = Vue.prototype.$serverPool = new Map();
Vue.prototype.$serverConfig = serverConfig;
Vue.prototype.$layoutConfig = layoutConfig;
