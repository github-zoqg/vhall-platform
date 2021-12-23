import Vue from 'vue';
import VmpContainer from '@/packages/container';
import VmpIconText from '@/packages/icon-text';
import VmpLanguageChoice from '@/packages/language-choice';
import serverRegisterMixin from '@/packages/mixins/server-register';
Vue.use(VmpContainer);
Vue.use(VmpIconText);
Vue.use(VmpLanguageChoice);

// 全局混入注册逻辑
Vue.mixin(serverRegisterMixin);

const layoutConfig = {
  lang: 'zh',
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
  // 顶部容器
  headerContainer: {
    component: 'VmpContainer',
    options: {
      className: 'vmp-header-container'
    },
    children: ['languageChoice']
  },
  // 左侧导航菜单
  asideMenu: {
    component: 'VmpContainer',
    options: {
      className: 'vmp-aside-menu'
    },
    children: ['docIconText', 'wbIconText']
  },
  // 语言选择
  languageChoice: {
    component: 'VmpLanguageChoice',
    options: {
      choices: [
        {
          value: 'zh',
          label: 'i18n.languageChoice.zh'
        },
        {
          value: 'en',
          label: 'i18n.languageChoice.en'
        }
      ]
    }
  },
  // 文档菜单
  docIconText: {
    component: 'VmpIconText',
    options: {
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
  }
};

window.$serverPool = Vue.prototype.$serverPool = new Map();
window.$serverConfig = Vue.prototype.$serverConfig = serverConfig;
window.$layoutConfig = Vue.prototype.$layoutConfig = layoutConfig;
