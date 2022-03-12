import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import grayInit from '@/packages/app-shared/gray-init';
import Subscribe from '../views/subscribe/index.vue';
import { authCheck } from '../../packages/app-shared/utils/wechat';

Vue.use(VueRouter);

const routes = [
  {
    path: '/lives/watch/:id',
    component: Home,
    name: 'LiveRoom',
    meta: { title: '直播间', grayType: 'webinar' }
  },
  {
    path: '/lives/embedclient/watch/:id',
    component: Home,
    name: 'LiveEmbedclientRoom',
    meta: { title: '直播间嵌入', grayType: 'webinar' }
  },
  {
    path: '/lives/subscribe/:id',
    component: Subscribe,
    name: 'SubcribeRoom',
    meta: { title: '预约页', grayType: 'webinar' }
  },
  {
    path: '/lives/embedclient/subscribe/:id',
    component: Subscribe,
    name: 'SubcribeEmbedclientRoom',
    meta: { title: '预约嵌入页', grayType: 'webinar' }
  },
  // 专题
  {
    path: '/special/detail',
    name: 'subject',
    component: () => import('../views/Subject/main.vue')
  },
  // 邀请卡
  {
    path: '/lives/invite/:id',
    name: 'inviteCard',
    component: () => import('../views/InviteCard/main.vue'),
    meta: { title: '邀请卡', grayType: 'webinar' }
  },
  {
    path: '/lives/entryform/:id',
    name: 'signup',
    component: () => import('@/packages/wap-sign-up-form'),
    meta: { grayType: 'webinar' }
  },
  // 错误页、升级页
  {
    path: '/upgrading',
    name: 'upgrading',
    component: () => import('../views/Upgrading.vue'),
    meta: { grayType: '' }
  },
  {
    path: '/lives/bind/:id',
    name: 'bind',
    component: () => import('../views/bind'),
    meta: { grayType: '' }
  },
  // 独立报名表单
  {
    path: '/lives/entryform/:id',
    name: 'entryform',
    component: () => import('../views/entryform/index.vue')
  },
  {
    path: '/user/home/:id', // 个人主页
    name: 'userHome',
    component: () => import('../views/user/userHome.vue'),
    meta: { grayType: 'user' }
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

router.beforeEach(async (to, from, next) => {
  const res = await grayInit(to);
  if (res) {
    console.log('---grayInit---', res);
    //处理限流逻辑
    if (res.code == 200) {
      //处理灰度、如果是中台用户, 跳转到中台
      const VUE_MIDDLE_SAAS_WATCH_WAP_PROJECT = process.env.VUE_MIDDLE_SAAS_WATCH_WAP_PROJECT;
      const VUE_APP_WAP_WATCH_MIDDLE = process.env.VUE_APP_WAP_WATCH_MIDDLE;
      let protocol = window.location.protocol;
      if (res.data.is_csd_user == 1) {
        if (window.location.origin != `${protocol}${VUE_APP_WAP_WATCH_MIDDLE}`) {
          window.location.href = `${protocol}${VUE_APP_WAP_WATCH_MIDDLE}/${VUE_MIDDLE_SAAS_WATCH_WAP_PROJECT}${window.location.pathname}`;
        }
      }
      authCheck(to, next);
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
    authCheck(to, next);
    next();
  }
});

export default router;
