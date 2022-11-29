import Vue from 'vue';
import VueRouter from 'vue-router';
// import Home from '../views/Home.vue';
import grayInit from '@/app-shared/gray-init';
// import Subscribe from '../views/subscribe/index.vue';
import { wxAuthCheck } from '@/app-shared/utils/wechat';
import pageConfig from '../page-config/index';

Vue.use(VueRouter);

const routes = [
  {
    path: '/lives/watch/:id',
    name: 'LiveRoom',
    component: () => import(/* webpackChunkName: "LiveRoom" */ '../views/Home.vue'),
    meta: { title: '直播间', grayType: 'webinar', page: 'main' }
  },
  {
    path: '/lives/embedclient/watch/:id',
    name: 'LiveEmbedclientRoom',
    component: () => import(/* webpackChunkName: "LiveEmbedclientRoom" */ '../views/Home.vue'),
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
    name: 'SubcribeRoom',
    component: () => import(/* webpackChunkName: "SubcribeRoom" */ '../views/subscribe/index.vue'),
    meta: { title: '预约页', grayType: 'webinar', page: 'subscribe' }
  },
  {
    path: '/lives/embedclient/subscribe/:id',
    name: 'SubcribeEmbedclientRoom',
    component: () =>
      import(/* webpackChunkName: "SubcribeEmbedclientRoom" */ '../views/subscribe/index.vue'),
    meta: { title: '预约嵌入页', grayType: 'webinar', page: 'subscribe' }
  },
  // 专题
  {
    path: '/special/detail',
    name: 'subject',
    component: () => import(/* webpackChunkName: "subject" */ '../views/Subject/main.vue'),
    meta: { title: '专题详情页', grayType: 'subject' }
  },
  // 邀请卡
  {
    path: '/lives/invite/:id',
    name: 'inviteCard',
    component: () => import(/* webpackChunkName: "inviteCard" */ '../views/InviteCard/main.vue'),
    meta: { title: '邀请卡', grayType: 'webinar' }
  },
  {
    path: '/lives/entryform/:id',
    name: 'signup',
    component: () => import(/* webpackChunkName: "signup" */ '@/packages/wap-sign-up-form'),
    meta: { grayType: 'webinar' }
  },
  {
    path: '/lives/embedclient/entryform/:id',
    name: 'signupEmbed',
    component: () => import('@/packages/wap-sign-up-form'),
    meta: { grayType: 'webinar' }
  },
  {
    path: '/special/entryform/:id',
    name: 'signupSubject',
    component: () => import('@/packages/wap-sign-up-form'),
    meta: { grayType: 'subject' }
  },
  // 错误页、升级页
  {
    path: '/upgrading',
    name: 'upgrading',
    component: () => import(/* webpackChunkName: "upgrading" */ '../views/Upgrading.vue'),
    meta: { grayType: '' }
  },
  {
    path: '/lives/bind/:id',
    name: 'bind',
    component: () => import(/* webpackChunkName: "bind" */ '../views/bind'),
    meta: { grayType: '' }
  },
  {
    path: '/lives/bindB/:id',
    name: 'bind',
    component: () => import(/* webpackChunkName: "bindB" */ '../views/bind'),
    meta: { grayType: '' }
  },
  // 独立报名表单
  // {
  //   path: '/lives/entryform/:id',
  //   name: 'entryform',
  //   component: () => import(/* webpackChunkName: "entryform" */ '../views/entryform/index.vue'),
  //   meta: { grayType: 'webinar' }
  // },
  {
    path: '/user/home/:id', // 个人主页
    name: 'userHome',
    component: () => import(/* webpackChunkName: "userHome" */ '../views/user/userHome.vue'),
    meta: { grayType: 'user' }
  },
  {
    path: '/lives/error/:id/:code', // 统一错误页
    name: 'PageError',
    component: () => import(/* webpackChunkName: "PageError" */ '../views/ErrorPage/error.vue'),
    meta: { title: '系统异常' }
  },
  {
    path: '/lives/question', // app-sdk内嵌问卷页
    name: 'appQuestion',
    component: () => import(/* webpackChunkName: "appQuestion" */ '../views/AppEmbedQuestion'),
    meta: { grayType: '' }
  },
  {
    path: '/lives/exam', // app-sdk内嵌快问快答页
    name: 'appExam',
    component: () => import(/* webpackChunkName: "appQuestion" */ '../views/AppEmbedExam'),
    meta: { grayType: '' }
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
    console.log('---grayInit---', res);
    //处理限流逻辑
    if (res.code == 200) {
      wxAuthCheck(to, next);
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
    wxAuthCheck(to, next);
  }
});

export default router;
