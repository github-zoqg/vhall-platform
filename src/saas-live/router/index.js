import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import NotFound from '../views/NotFound.vue';
import ChatAuth from '@/packages/chat-auth/index';
import PasswordLogin from '@/packages/password-login/index';
import grayInit from '@/app-shared/gray-init';
import pageConfig from '../page-config/index';

Vue.use(VueRouter);

const routes = [
  {
    path: '/lives/room/:id',
    component: Home,
    name: 'LiveRoom',
    meta: { title: '直播间', grayType: 'webinar', page: 'main' }
  },
  {
    path: '/lives/recordvideo/:id',
    component: () => import('../views/RecordVideo/index.vue'),
    name: 'RecordVideo',
    meta: { title: '录制视频', grayType: 'webinar', page: 'record' }
  },
  {
    path: '/lives/keylogin/:id/:role_name',
    name: 'KeyLogin',
    component: PasswordLogin,
    meta: { title: '口令登录', grayType: 'webinar' }
  },
  {
    path: '/lives/keylogin-host/:id/:role_name',
    name: 'KeyLoginHost',
    component: PasswordLogin,
    meta: { title: '口令登录', grayType: 'webinar' }
  },
  {
    path: '/lives/authchat/:id',
    name: 'ChatAuth',
    component: ChatAuth,
    meta: { title: '聊天审核', grayType: 'webinar' }
  },
  {
    path: '/lives/qa/:id',
    name: 'qa',
    component: () => import('@/packages/qa-admin/main.vue'),
    meta: { title: '问答', grayType: 'webinar' }
  },
  {
    path: '/lives/split-screen/:id',
    name: 'SplitScreen',
    component: () => import('../views/SplitScreen.vue'),
    meta: { title: '分屏', grayType: 'webinar', page: 'split-screen' }
  },
  {
    path: '/lives/video-polling/:id',
    name: 'VideoPolling',
    component: () => import('../views/VideoPolling'),
    meta: { title: '视频轮询', grayType: 'webinar', page: 'video-polling' }
  },
  {
    path: '/lives/client/:il_id', // 客户端嵌入
    name: 'Client',
    component: () => import('@/saas-live/views/clientEmbed/index'),
    meta: { page: 'client-embed' }
  },
  {
    path: '/lives/yun/:id', // 云导播
    name: 'yun',
    component: () => import('@/saas-live/views/yun'),
    meta: { keepAlive: false, grayType: 'webinar', page: 'live-yun' }
  },
  {
    path: '/lives/error/:id/:code', // 统一错误页
    name: 'PageError',
    meta: { title: '系统异常' },
    component: () => import('../views/ErrorPage/error.vue')
  },
  {
    // 其它没有匹配到的路由都会跳至此模块(404）
    // 该路由为必须路由，不需要权限，必须放在最后
    path: '*',
    name: 'notfound',
    component: NotFound,
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

  const res = await grayInit(to);
  if (res) {
    //处理限流逻辑
    if (res.code == 200) {
      const VUE_APP_ROUTER_BASE_URL = process.env.VUE_APP_ROUTER_BASE_URL;
      const VUE_APP_BUILD_VERSION = process.env.VUE_APP_BUILD_VERSION;
      const VUE_APP_WEB_BASE_SAAS = process.env.VUE_APP_WEB_BASE_SAAS; //发起端项目名

      // test
      res.data.version = '1.4.8';

      // 如果是B用户配置单独版本
      if (
        process.env.NODE_ENV != 'development' &&
        res.data.version &&
        res.data.version != VUE_APP_BUILD_VERSION
      ) {
        window.location.href = `${VUE_APP_WEB_BASE_SAAS}${VUE_APP_ROUTER_BASE_URL}/${res.data.version}${to.fullPath}`;
      } else {
        // 版本一致或者没有配置版本
        next();
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
