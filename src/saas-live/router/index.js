import Vue from 'vue';
import VueRouter from 'vue-router';
// import Home from '../views/Home.vue';
// import NotFound from '../views/NotFound.vue';
// import ChatAuth from '@/packages/chat-auth/index';
// import PasswordLogin from '@/packages/password-login/index';
import grayInit from '@/app-shared/gray-init';
import pageConfig from '../page-config/index';

Vue.use(VueRouter);

const routes = [
  {
    path: '/lives/room/:id',
    name: 'LiveRoom',
    component: () => import(/* webpackChunkName: "LiveRoom" */ '../views/Home.vue'),
    meta: { title: '直播间', grayType: 'webinar', page: 'main' }
  },
  {
    path: '/lives/recordvideo/:id',
    name: 'RecordVideo',
    component: () => import(/* webpackChunkName: "RecordVideo" */ '../views/RecordVideo/index.vue'),
    meta: { title: '录制视频', grayType: 'webinar', page: 'record' }
  },
  {
    path: '/lives/keylogin/:id/:role_name',
    name: 'KeyLogin',
    component: () => import(/* webpackChunkName: "KeyLogin" */ '@/packages/password-login/index'),
    meta: { title: '口令登录', grayType: 'webinar' }
  },
  {
    path: '/lives/keylogin-host/:id/:role_name',
    name: 'KeyLoginHost',
    component: () =>
      import(/* webpackChunkName: "KeyLoginHost" */ '@/packages/password-login/index'),
    meta: { title: '口令登录', grayType: 'webinar' }
  },
  {
    path: '/lives/authchat/:id',
    name: 'ChatAuth',
    component: () => import(/* webpackChunkName: "ChatAuth" */ '@/packages/chat-auth/index'),
    meta: { title: '聊天审核', grayType: 'webinar' }
  },
  {
    path: '/lives/qa/:id',
    name: 'qa',
    component: () => import(/* webpackChunkName: "qa" */ '@/packages/qa-admin/main.vue'),
    meta: { title: '问答', grayType: 'webinar' }
  },
  {
    path: '/lives/split-screen/:id',
    name: 'SplitScreen',
    component: () => import(/* webpackChunkName: "SplitScreen" */ '../views/SplitScreen.vue'),
    meta: { title: '分屏', grayType: 'webinar', page: 'split-screen' }
  },
  {
    path: '/lives/video-polling/:id',
    name: 'VideoPolling',
    component: () => import(/* webpackChunkName: "VideoPolling" */ '../views/VideoPolling'),
    meta: { title: '视频轮询', grayType: 'webinar', page: 'video-polling' }
  },
  {
    path: '/lives/client/:il_id', // 客户端嵌入
    name: 'Client',
    component: () => import(/* webpackChunkName: "Client" */ '@/saas-live/views/clientEmbed/index'),
    meta: { page: 'client-embed' }
  },
  {
    path: '/lives/yun/:id', // 云导播
    name: 'yun',
    component: () => import(/* webpackChunkName: "yun" */ '@/saas-live/views/yun'),
    meta: { keepAlive: false, grayType: 'webinar', page: 'live-yun' }
  },
  {
    path: '/lives/error/:id/:code', // 统一错误页
    name: 'PageError',
    component: () => import(/* webpackChunkName: "PageError" */ '../views/ErrorPage/error.vue'),
    meta: { title: '系统异常' }
  },
  {
    // 其它没有匹配到的路由都会跳至此模块(404）
    // 该路由为必须路由，不需要权限，必须放在最后
    path: '*',
    name: 'notfound',
    component: () => import(/* webpackChunkName: "notfound" */ '../views/NotFound.vue'),
    meta: { keepAlive: false, grayType: '' }
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.ROUTER_BASE_URL,
  routes
});

router.beforeEach(async (to, from, next) => {
  if (to.meta.page && (!window.$serverConfig || window.$serverConfig._page !== to.meta.page)) {
    // 根据不同的页面，动态加载不同的配置
    window.$serverConfig = pageConfig[to.meta.page];
    window.$serverConfig._page = to.meta.page;
  }
  const option = Object.assign({ source: 1 }, to); //source   1:发起端 0:其他端  默认其他端 （其他端不返回版本信息）
  const res = await grayInit(option);
  if (res) {
    //处理限流逻辑
    if (res.code == 200) {
      const VUE_APP_ROUTER_BASE_URL = process.env.VUE_APP_ROUTER_BASE_URL;
      const VUE_APP_BUILD_VERSION = process.env.VUE_APP_BUILD_VERSION;
      const VUE_APP_WEB_BASE = process.env.VUE_APP_WEB_BASE; //发起端项目名

      // test
      // res.data.version = '1.4.8';

      // 如果是B用户配置单独版本
      if (
        process.env.NODE_ENV != 'development' &&
        res.data.version &&
        res.data.version != VUE_APP_BUILD_VERSION
      ) {
        window.location.replace(
          `${VUE_APP_WEB_BASE}${VUE_APP_ROUTER_BASE_URL}/${res.data.version}${to.fullPath}`
        );
      } else {
        // 版本一致或者没有配置版本
        if (
          res.data.version == undefined &&
          window.location.href.indexOf(VUE_APP_BUILD_VERSION) != -1
        ) {
          // 如果没有服务配置版本并且地址栏有版本则跳转到无版本地址
          window.location.replace(`${VUE_APP_WEB_BASE}${VUE_APP_ROUTER_BASE_URL}${to.fullPath}`);
        } else {
          next();
        }
      }
    } else {
      next({
        name: 'PageError',
        params: {
          id: to.params.id,
          code: res.code
        }
      });
    }
  } else {
    next();
  }
});

export default router;
