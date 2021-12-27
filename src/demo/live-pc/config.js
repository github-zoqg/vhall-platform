import Vue from 'vue';
import VmpContainer from '@/packages/container';
import VmpAirContainer from '@/packages/air-container';
import VmpIconText from '@/packages/icon-text';
import VmpLanguageChoice from '@/packages/language-choice';
import VmpHeaderLeft from '@/packages/header-left';
import VmpPcPlayer from '@/packages/pc-player';
import serverRegisterMixin from '@/packages/mixins/server-register';

Vue.use(VmpContainer);
Vue.use(VmpAirContainer);
Vue.use(VmpIconText);
Vue.use(VmpLanguageChoice);
Vue.use(VmpHeaderLeft);
Vue.use(VmpPcPlayer);

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
  /*** 布局定义start */
  // 根节点
  layerRoot: {
    component: 'VmpAirContainer',
    children: ['layerHeader', 'layerBody']
  },
  // 顶部header容器
  layerHeader: {
    component: 'VmpContainer',
    className: 'vmp-basic-hd',
    children: ['pannelHeaderLeft', 'pannelHeaderRight']
  },
  // 中间主区域容器
  layerBody: {
    component: 'VmpContainer',
    options: {
      className: 'vmp-basic-bd'
    },
    children: ['layerBodyLeft', 'layerBodyCenter', 'layerBodyRight']
  },
  layerBodyLeft: {
    component: 'VmpContainer',
    className: 'vmp-basic-left',
    children: ['comAsideMenu']
  },
  layerBodyCenter: {
    component: 'VmpContainer',
    className: 'vmp-basic-center',
    children: ['comPcPlayer']
  },
  layerBodyRight: {
    component: 'VmpContainer',
    className: 'vmp-basic-right',
    children: ['layerBodyRightHeader', 'layerBodyRightBody']
  },
  layerBodyRightHeader: {
    component: 'VmpContainer',
    className: 'vmp-basic-right__hd'
  },
  layerBodyRightBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-right__bd'
  },
  /*** 布局定义end */

  /**** 组件定义 */
  // 顶部左侧容器
  pannelHeaderLeft: {
    component: 'VmpAirContainer',
    children: ['compHeaderLeft']
  },
  // 顶部右侧容器
  pannelHeaderRight: {
    component: 'VmpAirContainer',
    children: ['compLanguageChoice']
  },
  // 顶部左侧组件
  compHeaderLeft: {
    component: 'VmpHeaderLeft'
  },
  // 左侧导航菜单
  comAsideMenu: {
    component: 'VmpContainer',
    className: 'vmp-aside-menu',
    children: ['comDocMenu', 'comWbMenu']
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
  comDocMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'iconfont iconwendang',
      text: 'i18n.asideMenu.document'
    }
  },
  // 白板菜单
  comWbMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'iconfont iconbaiban',
      text: 'i18n.asideMenu.whiteBoard'
    },
    emitClick: [
      {
        cuid: 'comWbMenu',
        method: 'setSelectedState',
        args: [true]
      }
    ]
  },
  // 播放器
  comPcPlayer: {
    component: 'VmpPcPlayer'
  }
};

window.$serverConfig = Vue.prototype.$serverConfig = serverConfig;
window.$layoutConfig = Vue.prototype.$layoutConfig = layoutConfig;
