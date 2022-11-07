import Vue from 'vue';
import VueRouter from 'vue-router';
// import Home from '../views/Home.vue';
// import NotFound from '../views/NotFound.vue';
// import ChatAuth from '@/packages/chat-auth/index';
// import PasswordLogin from '@/packages/password-login/index';
import grayInit from '@/app-shared/gray-init';
import pageConfig from '../page-config/index';
import { useUserServer } from 'middle-domain';

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
    path: '/lives/clientembed/doc/:id', // 客户端嵌入文档
    name: 'ClientDoc',
    component: () => import('@/saas-live/views/clientEmbed/doc'),
    meta: { page: 'client-doc', grayType: 'webinar' }
  },
  {
    path: '/lives/clientembed/chat/:id', // 客户端嵌入聊天
    name: 'ClientIm',
    component: () => import('@/saas-live/views/clientEmbed/im'),
    meta: { page: 'client-im', grayType: 'webinar' }
  },
  {
    path: '/lives/clientembed/tools/:id', // 客户端嵌入互动
    name: 'ClientInteract',
    component: () => import('@/saas-live/views/clientEmbed/interact'),
    meta: { page: 'client-interact', grayType: 'webinar' }
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
  const linkToken = to.query?.token || to.query?.liveT || to.query?.live_token || '';
  //非地址栏 token信息加入 token刷新校验
  if (!linkToken) {
    const token = localStorage.getItem('token') || '';
    if (token) {
      //发起端、控制台进入页面添加刷新token机制,每七天刷新一次。  7*24*3600*1000 mm
      let tokenRefresh = localStorage.getItem('tokenRefresh') || new Date().getTime();
      tokenRefresh = parseFloat(tokenRefresh);
      const curTime = new Date().getTime();
      const dur = 7 * 24 * 3600 * 1000;
      console.log('Token-Refresh:', new Date(tokenRefresh).toLocaleString(), tokenRefresh);
      if (curTime - tokenRefresh > dur) {
        useUserServer()
          .refreshToken()
          .then(res => {
            console.log(res);
            localStorage.setItem('token', res.data.token || '');
            localStorage.setItem('tokenRefresh', new Date().getTime());
            localStorage.setItem('tokenExpiredTime', res.data.exp_time || '');
          })
          .catch(error => {
            // token 失效
            if (error.code == 511006 || error.code == 511007 || error.code == 511004) {
              localStorage.removeItem('token');
              localStorage.removeItem('tokenExpiredTime');
            }
          });
      }
    }
  }
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
      next();
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
