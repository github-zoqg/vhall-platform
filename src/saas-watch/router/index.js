import Vue from 'vue';
import VueRouter from 'vue-router';
// import Home from '../views/Home.vue';
// import Subscribe from '../views/Subscribe/index.vue';
// import entryForm from '../views/Subscribe/entryForm.vue';
// import forgetPwd from '../views/forgetPwd/index.vue';
import grayInit from '@/app-shared/gray-init';
import pageConfig from '../page-config/index';
import ssoAutoLogin from '@/app-shared/sso-auto-login';

Vue.use(VueRouter);

const routes = [
  {
    path: '/lives/watch/:id',
    name: 'LiveRoom',
    component: () => import(/* webpackChunkName: "LiveRoom" */ '../views/Home.vue'),
    meta: { title: '直播间', grayType: 'webinar', page: 'main' }
  },
  {
    path: '/lives/embedclient/watch/:id', //嵌入观看页
    name: 'LiveEmbedRoom',
    component: () => import(/* webpackChunkName: "LiveEmbedRoom" */ '../views/Home.vue'),
    meta: { title: '直播间嵌入', grayType: 'webinar', page: 'main' },
    redirect: to => {
      if (to.query.embed === 'video') {
        // 单视频嵌入
        location.replace(location.href.replace('embedclient', 'embedclientvideo'));
      } else {
        // 完全嵌入
        location.replace(location.href.replace('embedclient', 'embedclientfull'));
      }
    }
  },
  {
    path: '/lives/embedclientfull/watch/:id', //完全嵌入观看页
    name: 'LiveEmbedFullRoom',
    component: () => import(/* webpackChunkName: "LiveEmbedFullRoom" */ '../views/Home.vue'),
    meta: { title: '直播间嵌入', grayType: 'webinar', page: 'main' }
  },
  {
    path: '/lives/embedclientvideo/watch/:id', //单视频嵌入观看页
    name: 'LiveEmbedVideoRoom',
    component: () =>
      import(/* webpackChunkName: "LiveEmbedVideoRoom" */ '../views/EmbedVideo/index.vue'),
    meta: { title: '直播间嵌入', grayType: 'webinar', page: 'embed-video' }
  },
  {
    path: '/lives/subscribe/:id',
    name: 'Subscribe',
    component: () => import(/* webpackChunkName: "Subscribe" */ '../views/Subscribe/index.vue'),
    meta: { title: '预约', grayType: 'webinar', page: 'subscribe' }
  },
  {
    path: '/lives/embedclient/subscribe/:id', //嵌入预约页
    name: 'SubscribeEmbed',
    component: () =>
      import(/* webpackChunkName: "SubscribeEmbed" */ '../views/Subscribe/index.vue'),
    meta: { title: '预约嵌入', grayType: 'webinar', page: 'subscribe' }
  },
  {
    path: '/lives/entryform/:id',
    name: 'entryForm',
    component: () => import(/* webpackChunkName: "entryForm" */ '../views/Subscribe/entryForm.vue'),
    meta: { title: '独立报名表单', grayType: 'webinar' }
  },
  {
    path: '/forgetPwd',
    name: 'forgetPwd',
    component: () => import(/* webpackChunkName: "forgetPwd" */ '../views/forgetPwd/index.vue'),
    meta: { title: '忘记密码' }
  },
  {
    path: '/lives/error/:id/:code', // 统一错误页
    name: 'PageError',
    component: () => import(/* webpackChunkName: "PageError" */ '../views/ErrorPage/error.vue'),
    meta: { title: '系统异常' }
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.ROUTER_BASE_URL,
  routes
});

// 当前是否为开发环境
const isDev = process.env.NODE_ENV === 'development';

router.beforeEach(async (to, from, next) => {
  if (to.meta.page && (!window.$serverConfig || window.$serverConfig._page !== to.meta.page)) {
    // 根据不同的页面，动态加载不同的配置
    window.$serverConfig = pageConfig[to.meta.page];
    window.$serverConfig._page = to.meta.page;
  }

  const res = await grayInit(to);
  if (!isDev) {
    await ssoAutoLogin(); // sso自动登录置换token
  }
  console.log('---grayInit---', res);
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
