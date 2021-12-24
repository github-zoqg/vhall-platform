import Vue from 'vue';
import VmpContainer from '@/packages/container';
import VmpAirContainer from '@/packages/air-container';
import VmpIconText from '@/packages/icon-text';
import VmpLanguageChoice from '@/packages/language-choice';
import VmpHeaderLeft from '@/packages/header-left';
import serverRegisterMixin from '@/packages/mixins/server-register';

Vue.use(VmpContainer);
Vue.use(VmpAirContainer);
Vue.use(VmpIconText);
Vue.use(VmpLanguageChoice);
Vue.use(VmpHeaderLeft);

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
  rootHeader: {
    component: 'VmpAirContainer',
    children: ['pannelHeaderLeft', 'pannelHeaderRight']
  },
  pannelHeaderLeft: {
    component: 'VmpAirContainer',
    children: ['compHeaderLeft']
  },
  pannelHeaderRight: {
    component: 'VmpAirContainer',
    children: ['compLanguageChoice']
  },
  compHeaderLeft: {
    component: 'VmpHeaderLeft'
  },
  // 左侧导航菜单
  asideMenu: {
    component: 'VmpContainer',
    options: {
      className: 'vmp-aside-menu'
    },
    children: ['docIconText', 'wbIconText']
  },
  // 语言选择组件
  compLanguageChoice: {
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
      },
      {
        cuid: 'docIconText',
        method: 'setDisableState',
        args: [false]
      }
    ]
  }
};

window.$serverPool = Vue.prototype.$serverPool = new Map();
window.$serverConfig = Vue.prototype.$serverConfig = serverConfig;
window.$layoutConfig = Vue.prototype.$layoutConfig = layoutConfig;
