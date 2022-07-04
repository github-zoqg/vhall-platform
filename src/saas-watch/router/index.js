import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Subscribe from '../views/Subscribe/index.vue';
import entryForm from '../views/Subscribe/entryForm.vue';
import forgetPwd from '../views/forgetPwd/index.vue';
import grayInit from '@/app-shared/gray-init';
import ssoAutoLogin from '@/app-shared/sso-auto-login';

Vue.use(VueRouter);

const routes = [
  {
    path: '/lives/watch/:id',
    component: Home,
    name: 'LiveRoom',
    meta: { title: '直播间', grayType: 'webinar' }
  },
  {
    path: '/lives/embedclient/watch/:id', //嵌入观看页
    component: Home,
    name: 'LiveEmbedRoom',
    meta: { title: '直播间嵌入', grayType: 'webinar' },
    redirect: to => {
      if (to.query.embed === 'video') {
        // 单视频嵌入
        return {
          name: 'LiveEmbedVideoRoom',
          query: to.query,
          params: to.params
        };
      } else {
        // 完全嵌入
        return {
          name: 'LiveEmbedFullRoom',
          query: to.query,
          params: to.params
        };
      }
    }
  },
  {
    path: '/lives/embedclientfull/watch/:id', //完全嵌入观看页
    component: Home,
    name: 'LiveEmbedFullRoom',
    meta: { title: '直播间嵌入', grayType: 'webinar' }
  },
  {
    path: '/lives/embedclientvideo/watch/:id', //单视频嵌入观看页
    component: () => import('../views/EmbedVideo/index.vue'),
    name: 'LiveEmbedVideoRoom',
    meta: { title: '直播间嵌入', grayType: 'webinar' }
  },
  {
    path: '/lives/subscribe/:id',
    component: Subscribe,
    name: 'Subscribe',
    meta: { title: '预约', grayType: 'webinar' }
  },
  {
    path: '/lives/embedclient/subscribe/:id', //嵌入预约页
    component: Subscribe,
    name: 'SubscribeEmbed',
    meta: { title: '预约嵌入', grayType: 'webinar' }
  },
  {
    path: '/lives/entryform/:id',
    component: entryForm,
    name: 'entryForm',
    meta: { title: '独立报名表单', grayType: 'webinar' }
  },
  {
    path: '/forgetPwd',
    component: forgetPwd,
    name: 'forgetPwd',
    meta: { title: '忘记密码' }
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
  const res = await grayInit(to);
  if (isDev) {
    await ssoAutoLogin(); // sso自动登录置换token
  }
  console.log('---grayInit---', res);
  if (res) {
    //处理限流逻辑
    if (res.code == 200) {
      //处理灰度、如果是中台用户, 跳转到中台
      // const VUE_MIDDLE_SAAS_WATCH_WAP_PROJECT = process.env.VUE_MIDDLE_SAAS_WATCH_WAP_PROJECT;
      // const VUE_APP_WAP_WATCH_MIDDLE = process.env.VUE_APP_WAP_WATCH_MIDDLE;
      // let protocol = window.location.protocol;
      // if (res.data.is_csd_user == 1) {
      //   if (window.location.origin != `${protocol}${VUE_APP_WAP_WATCH_MIDDLE}`) {
      //     window.location.href = `${protocol}${VUE_APP_WAP_WATCH_MIDDLE}/${VUE_MIDDLE_SAAS_WATCH_WAP_PROJECT}${window.location.pathname}`;
      //   }
      // }
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
