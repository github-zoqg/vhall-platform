import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import grayInit from '@/packages/app-shared/gray-init';

Vue.use(VueRouter);

const routes = [
  {
    path: '/lives/watch/:id',
    component: Home,
    name: 'LiveRoom',
    meta: { title: '直播间', grayType: 'webinar' }
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
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.ROUTER_BASE_URL,
  routes
});

router.beforeEach(async (to, from, next) => {
  console.log('---grayInit---');
  await grayInit(to);
  next();
});

export default router;
