import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Subscribe from '../views/Subscribe/index.vue';
import entryForm from '../views/Subscribe/entryForm.vue';
import forgetPwd from '../views/forgetPwd/index.vue';
import grayInit from '@/app-shared/gray-init';
import pageConfig from '../page-config/index';
import Subject from '../views/Subject/index.vue';
import ssoAutoLogin from '@/app-shared/sso-auto-login';

Vue.use(VueRouter);

const routes = [
  {
    path: '/lives/watch/:id',
    component: Home,
    name: 'LiveRoom',
    meta: { title: '直播间', grayType: 'webinar', page: 'main' }
  },
  {
    path: '/lives/embedclient/watch/:id', //嵌入观看页
    component: Home,
    name: 'LiveEmbedRoom',
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
    component: Home,
    name: 'LiveEmbedFullRoom',
    meta: { title: '直播间嵌入', grayType: 'webinar', page: 'main' }
  },
  {
    path: '/lives/embedclientvideo/watch/:id', //单视频嵌入观看页
    component: () => import('../views/EmbedVideo/index.vue'),
    name: 'LiveEmbedVideoRoom',
    meta: { title: '直播间嵌入', grayType: 'webinar', page: 'embed-video' }
  },
  {
    path: '/lives/subscribe/:id',
    component: Subscribe,
    name: 'Subscribe',
    meta: { title: '预约', grayType: 'webinar', page: 'subscribe' }
  },
  {
    path: '/lives/embedclient/subscribe/:id', //嵌入预约页
    component: Subscribe,
    name: 'SubscribeEmbed',
    meta: { title: '预约嵌入', grayType: 'webinar', page: 'subscribe' }
  },
  {
    path: '/lives/entryform/:id',
    component: entryForm,
    name: 'entryForm',
    meta: { title: '独立报名表单', grayType: 'webinar' }
  },
  {
    path: '/subject/entryform/:id',
    component: entryForm,
    name: 'entryFormSubject',
    meta: { title: '独立报名表单', grayType: 'subject' }
  },
  {
    path: '/forgetPwd',
    component: forgetPwd,
    name: 'forgetPwd',
    meta: { title: '忘记密码' }
  },
  {
    path: '/special/detail',
    component: Subject,
    name: 'Subject',
    meta: { title: '专题详情', page: 'subject' }
  },
  {
    path: '/lives/error/:id/:code', // 统一错误页
    name: 'PageError',
    meta: { title: '系统异常' },
    component: () => import('../views/ErrorPage/error.vue')
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
